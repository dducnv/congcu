"use client";

import { useEffect, useState } from "react";
import { XMarkIcon, PlusIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import { uid } from "uid";
import { decryptData, encryptData } from "@/core/utils";

type TextareaQuicknoteItem = {
  date: string;
  notes: string;
  file_name: string;
  id: string;
};

export const TextareaQuicknote = () => {
  const [deleteTabIndex, setDeleteTabIndex] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState<TextareaQuicknoteItem | null>({
    date: "",
    notes: "",
    file_name: "",
    id: "",
  });

  const [textNotesList, setTextNotesList] = useState<TextareaQuicknoteItem[]>(
    []
  );

  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [showSearchReplace, setShowSearchReplace] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [replaceTerm, setReplaceTerm] = useState("");
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const [showStats, setShowStats] = useState(false);

  const dateTimeNow = new Date().toLocaleString();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const textNotesListData = localStorage.getItem("textNotesList");
      if (textNotesListData) {
        const textNotesListDataParsed: TextareaQuicknoteItem[] =
          JSON.parse(textNotesListData);
        setTextNotesList(textNotesListDataParsed);
        setSelectedTab(textNotesListDataParsed[0]);
      } else {
        const newTab = {
          date: dateTimeNow,
          notes: "",
          file_name: "New Tab",
          id: uid(),
        };

        localStorage.setItem("textNotesList", JSON.stringify([newTab]));
        setTextNotesList([newTab]);
        setSelectedTab(newTab);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function downloadFile(filename: string, text: string) {
    if (text === "") {
      alert("Không thể tải file rỗng");
      return;
    }

    const filName = prompt("Nhập tên file", filename.replace(".txt", ""));
    if (filName === null) {
      return;
    }

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(text)
    );
    element.setAttribute("download", filName + ".txt");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  function importFile(): void {
    const input: HTMLInputElement = document.createElement("input");
    input.type = "file";
    input.onchange = function (e: Event): void {
      const fileInput = e.target as HTMLInputElement;
      const file: File | null = fileInput.files?.[0] || null;

      if (file) {
        const reader: FileReader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (
          readerEvent: ProgressEvent<FileReader>
        ): void {
          const content: string | ArrayBuffer | null =
            readerEvent.target?.result || null;

          if (content) {
            const newTab: TextareaQuicknoteItem = {
              date: dateTimeNow,
              notes: content.toString(),
              file_name: file.name.split(".")[0].trim(),
              id: uid(),
            };

            setSelectedTab(newTab);
            setTextNotesList([...textNotesList, newTab]);
            localStorage.setItem(
              "textNotesList",
              JSON.stringify([...textNotesList, newTab])
            );
          }
        };
      }
    };
    input.click();
  }

  function addTabNotes() {
    var tabName = prompt("Nhập tên tab", "New Tab");
    const newTab = {
      date: dateTimeNow,
      notes: "",
      file_name: tabName ?? "New Tab",
      id: uid(),
    };

    setSelectedTab(newTab);
    setTextNotesList([...textNotesList, newTab]);
    localStorage.setItem(
      "textNotesList",
      JSON.stringify([...textNotesList, newTab])
    );
  }

  function selectTabNotes(tab: TextareaQuicknoteItem) {
    setSelectedTab(tab);
  }

  // ...

  function deleteTabNotes(tab: TextareaQuicknoteItem) {
    if (textNotesList.length === 1) {
      alert("Không thể xóa tab cuối cùng");
      return;
    }
    if (tab.notes !== "" && !confirm("Bạn có chắc chắn muốn xóa tab này?")) {
      return;
    }
    const getIndexOfTab = textNotesList.findIndex((item) => item.id === tab.id);
    setDeleteTabIndex(getIndexOfTab);
    const newTabList = textNotesList.filter((item) => item.id !== tab.id);

    if (selectedTab && selectedTab.id !== tab.id) {
      setDeleteTabIndex(-1);
    }

    setTextNotesList(newTabList);
    localStorage.setItem("textNotesList", JSON.stringify(newTabList));
  }

  useEffect(() => {
    if (textNotesList.length > 0) {
      if (selectedTab === null || !textNotesList.includes(selectedTab)) {
        if (deleteTabIndex !== -1 && deleteTabIndex !== null) {
          setSelectedTab(textNotesList[deleteTabIndex - 1]);
        } else {
          setSelectedTab(textNotesList[0]);
        }
      }
    }
  }, [deleteTabIndex, selectedTab, textNotesList]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest('.format-dropdown')) {
        setShowFormatDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ...

  function editTextNotes(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const newTabList = textNotesList.map((item) => {
      if (item.id === selectedTab?.id) {
        return {
          ...item,
          notes: e.target.value,
        };
      }
      return item;
    });

    setTextNotesList(newTabList);
    setSelectedTab(
      newTabList.find(
        (item) => item.id === selectedTab?.id
      ) as TextareaQuicknoteItem
    );
    localStorage.setItem("textNotesList", JSON.stringify(newTabList));
  }

  function editFileName(tab: TextareaQuicknoteItem) {
    var tabName = prompt("Nhập tên tab", tab.file_name);

    if (tabName === null) {
      return;
    }

    const newTabList = textNotesList.map((item) => {
      if (item.id === tab.id) {
        return {
          ...item,
          file_name: tabName ?? "New Tab",
        };
      }
      return item;
    });

    setTextNotesList(newTabList);

    localStorage.setItem("textNotesList", JSON.stringify(newTabList));
    setSelectedTab(
      newTabList.find((item) => item.id === tab.id) as TextareaQuicknoteItem
    );
  }

  function backupData() {
    const data = JSON.stringify(textNotesList);
    //encode the data
    var dataEncoded = encryptData(data, process.env.PRIVATE_KEY as string);
    const blob = new Blob([dataEncoded], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quicknote-backup-${dateTimeNow}.txt`;
    a.click();
  }

  function importBackupData() {
    try {
      const input: HTMLInputElement = document.createElement("input");
      input.type = "file";
      input.onchange = function (e: Event): void {
        const fileInput = e.target as HTMLInputElement;
        const file: File | null = fileInput.files?.[0] || null;

        if (file) {
          if (file.name.split(".")[1] !== "txt") {
            alert("File không hợp lệ");
            return;
          }
          const reader: FileReader = new FileReader();
          reader.readAsText(file, "UTF-8");
          reader.onload = function (
            readerEvent: ProgressEvent<FileReader>
          ): void {
            const content: string | ArrayBuffer | null =
              readerEvent.target?.result || null;

            if (content) {
              var dataDecoded = decryptData(
                content.toString(),
                process.env.PRIVATE_KEY as string
              );

              if (dataDecoded === null) {
                alert("Lỗi khi giải mã file");
                return;
              }
              //check if json is valid

              try {
                JSON.parse(dataDecoded.toString());
              } catch (e) {
                alert("File không hợp lệ");
                return;
              }

              const newTabList: TextareaQuicknoteItem[] = JSON.parse(
                dataDecoded.toString()
              );

              setTextNotesList([...textNotesList, ...newTabList]);
              setSelectedTab(newTabList[0]);
              localStorage.setItem(
                "textNotesList",
                JSON.stringify([...textNotesList, ...newTabList])
              );
            }
          };
        }
      };
      input.click();
    } catch (error) {
      alert("Lỗi khi import file");
    }
  }

  function formatText() {
    if (!selectedTab || !selectedTab.notes) {
      alert("Không có nội dung để format");
      return;
    }

    // Chuyển đổi văn bản nhiều dòng thành một đoạn văn thẳng
    const formattedText = selectedTab.notes
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join(' ');

    const newTabList = textNotesList.map((item) => {
      if (item.id === selectedTab?.id) {
        return {
          ...item,
          notes: formattedText,
        };
      }
      return item;
    });

    setTextNotesList(newTabList);
    setSelectedTab(
      newTabList.find(
        (item) => item.id === selectedTab?.id
      ) as TextareaQuicknoteItem
    );
    localStorage.setItem("textNotesList", JSON.stringify(newTabList));
  }

  function updateTextContent(newText: string) {
    const newTabList = textNotesList.map((item) => {
      if (item.id === selectedTab?.id) {
        return {
          ...item,
          notes: newText,
        };
      }
      return item;
    });

    setTextNotesList(newTabList);
    setSelectedTab(
      newTabList.find(
        (item) => item.id === selectedTab?.id
      ) as TextareaQuicknoteItem
    );
    localStorage.setItem("textNotesList", JSON.stringify(newTabList));
  }

  function formatToParagraph() {
    if (!selectedTab || !selectedTab.notes) {
      alert("Không có nội dung để format");
      return;
    }

    // Chuyển đổi văn bản nhiều dòng thành một đoạn văn thẳng
    const formattedText = selectedTab.notes
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join(' ');

    updateTextContent(formattedText);
    setShowFormatDropdown(false);
  }

  function formatToUpperCase() {
    if (!selectedTab || !selectedTab.notes) {
      alert("Không có nội dung để format");
      return;
    }

    const formattedText = selectedTab.notes.toUpperCase();
    updateTextContent(formattedText);
    setShowFormatDropdown(false);
  }

  function formatToLowerCase() {
    if (!selectedTab || !selectedTab.notes) {
      alert("Không có nội dung để format");
      return;
    }

    const formattedText = selectedTab.notes.toLowerCase();
    updateTextContent(formattedText);
    setShowFormatDropdown(false);
  }

  function formatToTitleCase() {
    if (!selectedTab || !selectedTab.notes) {
      alert("Không có nội dung để format");
      return;
    }

    const formattedText = selectedTab.notes
      .toLowerCase()
      .split(' ')
      .map(word => {
        if (word.length === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
    
    updateTextContent(formattedText);
    setShowFormatDropdown(false);
  }

  function formatToSentenceCase() {
    if (!selectedTab || !selectedTab.notes) {
      alert("Không có nội dung để format");
      return;
    }

    const formattedText = selectedTab.notes
      .toLowerCase()
      .replace(/(^\w|\.\s+\w)/g, (char) => char.toUpperCase());
    
    updateTextContent(formattedText);
    setShowFormatDropdown(false);
  }

  function formatCapitalizeLines() {
    if (!selectedTab || !selectedTab.notes) {
      alert("Không có nội dung để format");
      return;
    }

    const formattedText = selectedTab.notes
      .split('\n')
      .map(line => {
        const trimmed = line.trim();
        if (trimmed.length === 0) return line;
        return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
      })
      .join('\n');
    
    updateTextContent(formattedText);
    setShowFormatDropdown(false);
  }

  function formatRemoveExtraSpaces() {
    if (!selectedTab || !selectedTab.notes) {
      alert("Không có nội dung để format");
      return;
    }

    const formattedText = selectedTab.notes
      // Loại bỏ nhiều khoảng trắng liên tiếp thành 1 khoảng trắng
      .replace(/[ \t]+/g, ' ')
      // Loại bỏ khoảng trắng ở đầu và cuối mỗi dòng
      .split('\n')
      .map(line => line.trim())
      .join('\n')
      // Loại bỏ nhiều dòng trống liên tiếp thành 1 dòng trống
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      // Loại bỏ khoảng trắng ở đầu và cuối toàn bộ văn bản
      .trim();
    
    updateTextContent(formattedText);
    setShowFormatDropdown(false);
  }

  function searchInText() {
    if (!searchTerm || !selectedTab?.notes) {
      setSearchResults([]);
      setCurrentSearchIndex(-1);
      return;
    }

    const text = selectedTab.notes.toLowerCase();
    const term = searchTerm.toLowerCase();
    const results: number[] = [];
    
    let index = text.indexOf(term);
    while (index !== -1) {
      results.push(index);
      index = text.indexOf(term, index + 1);
    }
    
    setSearchResults(results);
    setCurrentSearchIndex(results.length > 0 ? 0 : -1);
  }

  function nextSearchResult() {
    if (searchResults.length === 0) return;
    const nextIndex = (currentSearchIndex + 1) % searchResults.length;
    setCurrentSearchIndex(nextIndex);
    scrollToSearchResult(nextIndex);
  }

  function prevSearchResult() {
    if (searchResults.length === 0) return;
    const prevIndex = currentSearchIndex <= 0 ? searchResults.length - 1 : currentSearchIndex - 1;
    setCurrentSearchIndex(prevIndex);
    scrollToSearchResult(prevIndex);
  }

  function scrollToSearchResult(index: number) {
    if (index < 0 || index >= searchResults.length) return;
    
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea) {
      const position = searchResults[index];
      textarea.focus();
      textarea.setSelectionRange(position, position + searchTerm.length);
      textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function replaceOne() {
    if (!selectedTab?.notes || searchResults.length === 0 || currentSearchIndex < 0) {
      return;
    }

    const position = searchResults[currentSearchIndex];
    const newText = selectedTab.notes.substring(0, position) + 
                   replaceTerm + 
                   selectedTab.notes.substring(position + searchTerm.length);
    
    updateTextContent(newText);
    
    // Cập nhật lại kết quả tìm kiếm
    setTimeout(() => {
      searchInText();
    }, 100);
  }

  function replaceAll() {
    if (!selectedTab?.notes || !searchTerm) {
      return;
    }

    const newText = selectedTab.notes.replace(
      new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), 
      replaceTerm
    );
    
    updateTextContent(newText);
    
    // Reset tìm kiếm
    setSearchResults([]);
    setCurrentSearchIndex(-1);
    setSearchTerm("");
    setReplaceTerm("");
  }

  // Tự động tìm kiếm khi searchTerm thay đổi
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchInText();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedTab?.notes]);

  // Phím tắt
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey && event.key === 'f') {
        event.preventDefault();
        setShowSearchReplace(true);
        setTimeout(() => {
          const searchInput = document.querySelector('input[placeholder="Tìm kiếm..."]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
          }
        }, 100);
      }
      
      if (event.key === 'Escape' && showSearchReplace) {
        setShowSearchReplace(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showSearchReplace]);

  // Hàm tính toán thống kê văn bản
  function calculateTextStats() {
    if (!selectedTab?.notes) {
      return {
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        lines: 0,
        paragraphs: 0,
        readingTime: 0
      };
    }

    const text = selectedTab.notes;
    
    // Đếm ký tự
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    
    // Đếm từ (loại bỏ khoảng trắng thừa và chia theo khoảng trắng)
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    
    // Đếm dòng
    const lines = text === '' ? 0 : text.split('\n').length;
    
    // Đếm đoạn văn (dòng không rỗng)
    const paragraphs = text.trim() === '' ? 0 : text.split('\n').filter(line => line.trim() !== '').length;
    
    // Tính thời gian đọc (trung bình 200 từ/phút)
    const readingTime = Math.ceil(words / 200);

    return {
      characters,
      charactersNoSpaces,
      words,
      lines,
      paragraphs,
      readingTime
    };
  }

  const textStats = calculateTextStats();

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex space-x-3 mb-3">
          <a
            onClick={() =>
              downloadFile(
                selectedTab?.file_name ?? "file name",
                selectedTab?.notes ?? ""
              )
            }
            className="hover:underline hover:cursor-pointer"
          >
            Lưu
          </a>
          <a
            onClick={importFile}
            className="hover:underline hover:cursor-pointer"
          >
            thêm file
          </a>
          <div className="relative format-dropdown">
            <a
              onClick={() => setShowFormatDropdown(!showFormatDropdown)}
              className="hover:underline hover:cursor-pointer flex items-center space-x-1"
            >
              Format <ChevronDownIcon className="w-4 h-4" />
            </a>
            {showFormatDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-black z-10 min-w-48">
                <div className="py-1">
                  <a
                    onClick={formatToParagraph}
                    className="block px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                  >
                    Chuyển thành đoạn văn
                  </a>
                  <a
                    onClick={formatToUpperCase}
                    className="block px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                  >
                    VIẾT HOA TẤT CẢ
                  </a>
                  <a
                    onClick={formatToLowerCase}
                    className="block px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                  >
                    viết thường tất cả
                  </a>
                  <a
                    onClick={formatToTitleCase}
                    className="block px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                  >
                    Viết Hoa Chữ Cái Đầu Mỗi Từ
                  </a>
                  <a
                    onClick={formatToSentenceCase}
                    className="block px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                  >
                    Viết hoa chữ cái đầu câu
                  </a>
                  <a
                    onClick={formatCapitalizeLines}
                    className="block px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                  >
                    Viết hoa đầu mỗi dòng
                  </a>
                  <a
                    onClick={formatRemoveExtraSpaces}
                    className="block px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                  >
                    Xóa khoảng trắng thừa
                  </a>
                </div>
              </div>
            )}
          </div>
          <a
            onClick={() => setShowSearchReplace(!showSearchReplace)}
            className="hover:underline hover:cursor-pointer"
          >
            Tìm kiếm
          </a>
          <a
            onClick={() => setShowStats(!showStats)}
            className="hover:underline hover:cursor-pointer"
          >
            Thống kê
          </a>
        </div>
        <div className="flex space-x-3">
          <a
            onClick={backupData}
            className="hover:underline hover:cursor-pointer"
          >
            Sao lưu
          </a>
          <a
            onClick={importBackupData}
            className="hover:underline hover:cursor-pointer"
          >
            Khôi phục
          </a>
        </div>
      </div>
      <div className="flex items-center mb-3 space-x-2">
        <div className="flex items-center space-x-3 overflow-x-auto w-full tab-scroll">
          {textNotesList.map((item) => (
            <div
              key={item.id}
              className={`
                                min-w-32 max-w-44
                                flex space-x-2 justify-center items-center border hover:cursor-pointer  pl-2 pr-1 py-1 ${
                                  item.id === selectedTab?.id
                                    ? "bg-gray-50 border-black"
                                    : "border-gray-300 text-gray-500"
                                }`}
            >
              <span
                onDoubleClick={() => editFileName(item)}
                onClick={() => selectTabNotes(item)}
                className="truncate w-full"
              >
                {item.file_name}
              </span>
              <button
                onClick={() => deleteTabNotes(item)}
                className="rounded-full hover:bg-gray-200  p-2 flex justify-center items-center "
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addTabNotes}
          className="rounded-full hover:bg-gray-200  p-2 flex justify-center items-center"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>

      {showSearchReplace && (
        <div className="mb-3 p-4 border border-black bg-gray-50">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 border border-black focus:outline-none focus:border-black"
              />
              <button
                onClick={prevSearchResult}
                disabled={searchResults.length === 0}
                className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                ↑
              </button>
              <button
                onClick={nextSearchResult}
                disabled={searchResults.length === 0}
                className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                ↓
              </button>
              <span className="text-sm text-gray-600 min-w-20">
                {searchResults.length > 0 ? `${currentSearchIndex + 1}/${searchResults.length}` : '0/0'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Thay thế bằng..."
                value={replaceTerm}
                onChange={(e) => setReplaceTerm(e.target.value)}
                className="flex-1 px-3 py-2 border border-black focus:outline-none focus:border-black"
              />
              <button
                onClick={replaceOne}
                disabled={searchResults.length === 0 || currentSearchIndex < 0}
                className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Thay thế
              </button>
              <button
                onClick={replaceAll}
                disabled={searchResults.length === 0}
                className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Thay thế tất cả
              </button>
              <button
                onClick={() => setShowSearchReplace(false)}
                className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {showStats && (
        <div className="mb-3 p-4 border border-black bg-blue-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-800">📊 Thống kê văn bản</h3>
            <button
              onClick={() => setShowStats(false)}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
            >
              Đóng
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-3 border border-black">
              <div className="text-2xl font-bold text-blue-600">{textStats.words.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Số từ</div>
            </div>
            
            <div className="bg-white p-3 border border-black">
              <div className="text-2xl font-bold text-green-600">{textStats.characters.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Ký tự (có dấu cách)</div>
            </div>
            
            <div className="bg-white p-3 border border-black">
              <div className="text-2xl font-bold text-purple-600">{textStats.charactersNoSpaces.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Ký tự (không dấu cách)</div>
            </div>
            
            <div className="bg-white p-3 border border-black">
              <div className="text-2xl font-bold text-orange-600">{textStats.lines.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Số dòng</div>
            </div>
            
            <div className="bg-white p-3 border border-black">
              <div className="text-2xl font-bold text-red-600">{textStats.paragraphs.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Đoạn văn</div>
            </div>
            
            <div className="bg-white p-3 border border-black">
              <div className="text-2xl font-bold text-indigo-600">
                {textStats.readingTime} {textStats.readingTime === 1 ? 'phút' : 'phút'}
              </div>
              <div className="text-sm text-gray-600">Thời gian đọc</div>
            </div>
            
            <div className="bg-white p-3 border border-black">
              <div className="text-2xl font-bold text-teal-600">
                {textStats.words > 0 ? (textStats.characters / textStats.words).toFixed(1) : '0'}
              </div>
              <div className="text-sm text-gray-600">Ký tự/từ trung bình</div>
            </div>
            
            <div className="bg-white p-3 border border-black">
              <div className="text-2xl font-bold text-pink-600">
                {textStats.lines > 0 ? (textStats.words / textStats.lines).toFixed(1) : '0'}
              </div>
              <div className="text-sm text-gray-600">Từ/dòng trung bình</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-white border border-black">
            <div className="text-sm text-gray-600 space-y-1">
              <div>💡 <strong>Thời gian đọc</strong> được tính dựa trên tốc độ đọc trung bình 200 từ/phút</div>
              <div>📖 <strong>Đoạn văn</strong> là số dòng có nội dung (không tính dòng trống)</div>
              <div>⚡ <strong>Thống kê</strong> được cập nhật tự động khi bạn chỉnh sửa văn bản</div>
            </div>
          </div>
        </div>
      )}

      <textarea
        onChange={editTextNotes}
        spellCheck="true"
        value={selectedTab?.notes ?? ""}
        placeholder="Nhập nội dung"
        rows={20}
        className="w-full outline-none border min-h-250 border-black p-3 min-h-fit text-xl text-mono"
      />

      <div className="flex justify-between items-center">
        <span>Thay đổi lần cuối lúc: {selectedTab?.date}</span>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>{textStats.words} từ</span>
          <span>{textStats.characters} ký tự</span>
          <span>{textStats.lines} dòng</span>
          {textStats.readingTime > 0 && (
            <span>~{textStats.readingTime} phút đọc</span>
          )}
        </div>
      </div>
    </>
  );
};
