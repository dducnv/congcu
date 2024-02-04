"use client";

import { useEffect, useState } from "react";
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/solid";
import { uid } from "uid";

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
            reader.onload = function (readerEvent: ProgressEvent<FileReader>): void {
                const content: string | ArrayBuffer | null = readerEvent.target?.result || null;

                if (content) {
                    const newTab: TextareaQuicknoteItem = {
                        date: dateTimeNow,
                        notes: content.toString(),
                        file_name: file.name.replace(".txt", "").trim(),
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
    const newTab = {
      date: dateTimeNow,
      notes: "",
      file_name: "New Tab",
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
    console.log(tab);
    setSelectedTab(tab);
  }

  // ...

  function deleteTabNotes(tab: TextareaQuicknoteItem) {
    if (textNotesList.length === 1) {
      alert("Không thể xóa tab cuối cùng");
      return;
    }
    if(tab.notes !== "" && !confirm("Bạn có chắc chắn muốn xóa tab này?")) {
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
        }else {
          setSelectedTab(textNotesList[0]);
        }

      }
    }
  }, [deleteTabIndex, selectedTab, textNotesList]);

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
      newTabList.find((item) => item.id === selectedTab?.id) as TextareaQuicknoteItem
    );
    localStorage.setItem("textNotesList", JSON.stringify(newTabList));
  }

  return (
    <>
       <div className="flex space-x-3 mb-3">
          <a
            onClick={() =>
              downloadFile(selectedTab?.file_name ?? "file name", selectedTab?.notes ?? "")
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
        </div>
      <div className="flex items-center mb-3 space-x-2">
        <div className="flex items-center space-x-3  overflow-auto tab-scroll relative">
          {textNotesList.map((item) => (
            <div
              key={item.id}
              className={`
                                max-w-32 min-w-32
                                flex space-x-2 justify-center items-center border hover:cursor-pointer  pl-2 pr-1 py-1 ${
                                  item.id === selectedTab?.id
                                    ? "bg-gray-50 border-black"
                                    : "border-gray-300 text-gray-500"
                                }`}
            >
              <span onClick={() => selectTabNotes(item)} className="truncate">
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
        <span>{selectedTab?.notes?.length}</span>
      </div>
    </>
  );
};
