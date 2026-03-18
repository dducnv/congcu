"use client";

import { decryptData, encryptData } from "@/core/utils";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { uid } from "uid";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

  const [showSearchReplace, setShowSearchReplace] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [replaceTerm, setReplaceTerm] = useState("");
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const [showStats, setShowStats] = useState(false);
  const [markdownMode, setMarkdownMode] = useState(false);
  const [showFormatTools, setShowFormatTools] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      alert("Cannot download empty file");
      return;
    }

    const filName = prompt("Enter file name", filename.replace(".txt", ""));
    if (filName === null) {
      return;
    }

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(text)
    );
    element.setAttribute("download", filName + (markdownMode ? ".md" : ".txt"));
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
    var tabName = prompt("Enter tab name", "New Tab");
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
      alert("Cannot delete the last tab");
      return;
    }
    if (tab.notes !== "" && !confirm("Are you sure you want to delete this tab?")) {
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
    var tabName = prompt("Enter tab name", tab.file_name);

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
            alert("Invalid file");
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
                alert("Error decrypting file");
                return;
              }
              //check if json is valid

              try {
                JSON.parse(dataDecoded.toString());
              } catch (e) {
                alert("Invalid file");
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
      alert("Error importing file");
    }
  }

  const updateTextContent = useCallback((newText: string) => {
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
  }, [textNotesList, selectedTab?.id]);

  function formatToParagraph() {
    if (!selectedTab || !selectedTab.notes) {
      alert("No content to format");
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const selectedText = selectedTab.notes.substring(start, end);
      const formattedText = selectedText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join(' ');

      const newText = selectedTab.notes.substring(0, start) + formattedText + selectedTab.notes.substring(end);
      updateTextContent(newText);
    } else {
      const formattedText = selectedTab.notes
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join(' ');

      updateTextContent(formattedText);
    }
  }

  function formatToUpperCase() {
    if (!selectedTab || !selectedTab.notes) {
      alert("No content to format");
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const selectedText = selectedTab.notes.substring(start, end);
      const formattedText = selectedText.toUpperCase();
      const newText = selectedTab.notes.substring(0, start) + formattedText + selectedTab.notes.substring(end);
      updateTextContent(newText);
    } else {
      const formattedText = selectedTab.notes.toUpperCase();
      updateTextContent(formattedText);
    }
  }

  function formatToLowerCase() {
    if (!selectedTab || !selectedTab.notes) {
      alert("No content to format");
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const selectedText = selectedTab.notes.substring(start, end);
      const formattedText = selectedText.toLowerCase();
      const newText = selectedTab.notes.substring(0, start) + formattedText + selectedTab.notes.substring(end);
      updateTextContent(newText);
    } else {
      const formattedText = selectedTab.notes.toLowerCase();
      updateTextContent(formattedText);
    }
  }

  function formatToTitleCase() {
    if (!selectedTab || !selectedTab.notes) {
      alert("No content to format");
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const selectedText = selectedTab.notes.substring(start, end);
      const formattedText = selectedText
        .toLowerCase()
        .split(' ')
        .map(word => {
          if (word.length === 0) return word;
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');

      const newText = selectedTab.notes.substring(0, start) + formattedText + selectedTab.notes.substring(end);
      updateTextContent(newText);
    } else {
      const formattedText = selectedTab.notes
        .toLowerCase()
        .split(' ')
        .map(word => {
          if (word.length === 0) return word;
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');

      updateTextContent(formattedText);
    }
  }

  function formatToSentenceCase() {
    if (!selectedTab || !selectedTab.notes) {
      alert("No content to format");
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const selectedText = selectedTab.notes.substring(start, end);
      const formattedText = selectedText
        .toLowerCase()
        .replace(/(^\w|\.\s+\w)/g, (char) => char.toUpperCase());

      const newText = selectedTab.notes.substring(0, start) + formattedText + selectedTab.notes.substring(end);
      updateTextContent(newText);
    } else {
      const formattedText = selectedTab.notes
        .toLowerCase()
        .replace(/(^\w|\.\s+\w)/g, (char) => char.toUpperCase());

      updateTextContent(formattedText);
    }
  }

  function formatCapitalizeLines() {
    if (!selectedTab || !selectedTab.notes) {
      alert("No content to format");
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const selectedText = selectedTab.notes.substring(start, end);
      const formattedText = selectedText
        .split('\n')
        .map(line => {
          const trimmed = line.trim();
          if (trimmed.length === 0) return line;
          return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
        })
        .join('\n');

      const newText = selectedTab.notes.substring(0, start) + formattedText + selectedTab.notes.substring(end);
      updateTextContent(newText);
    } else {
      const formattedText = selectedTab.notes
        .split('\n')
        .map(line => {
          const trimmed = line.trim();
          if (trimmed.length === 0) return line;
          return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
        })
        .join('\n');

      updateTextContent(formattedText);
    }
  }

  function formatRemoveExtraSpaces() {
    if (!selectedTab || !selectedTab.notes) {
      alert("No content to format");
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const selectedText = selectedTab.notes.substring(start, end);
      const formattedText = selectedText
        .replace(/[ \t]+/g, ' ')
        .split('\n')
        .map(line => line.trim())
        .join('\n')
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .trim();

      const newText = selectedTab.notes.substring(0, start) + formattedText + selectedTab.notes.substring(end);
      updateTextContent(newText);
    } else {
      const formattedText = selectedTab.notes
        .replace(/[ \t]+/g, ' ')
        .split('\n')
        .map(line => line.trim())
        .join('\n')
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .trim();

      updateTextContent(formattedText);
    }
  }

  function formatRemoveSpacing() {
    if (!selectedTab || !selectedTab.notes) {
      alert("No content to format");
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const selectedText = selectedTab.notes.substring(start, end);
      const formattedText = selectedText
        .replace(/\n\s*\n/g, '\n')
        .split('\n')
        .map(line => line.trim())
        .join('\n')
        .trim();

      const newText = selectedTab.notes.substring(0, start) + formattedText + selectedTab.notes.substring(end);
      updateTextContent(newText);
    } else {
      const formattedText = selectedTab.notes
        .replace(/\n\s*\n/g, '\n')
        .split('\n')
        .map(line => line.trim())
        .join('\n')
        .trim();

      updateTextContent(formattedText);
    }
  }

  const formatSelectedText = useCallback((prefix: string) => {
    if (!selectedTab?.notes) {
      alert("No content to format");
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start === end) {
      alert("Please select text before formatting");
      return;
    }

    const selectedText = selectedTab.notes.substring(start, end);
    const lines = selectedText.split('\n');

    const formattedLines = lines.map(line => {
      if (line.trim() === '') return line;

      const trimmedLine = line.trim();
      const removePattern = /^(\d+\.\s*|[a-z]\.\s*|[A-Z]\.\s*|•\s*|-\s*|\+\s*|\*\s*|→\s*|\t+|\s+)/;
      const cleanedLine = trimmedLine.replace(removePattern, '');

      return prefix + cleanedLine;
    });

    const formattedText = formattedLines.join('\n');
    const newText = selectedTab.notes.substring(0, start) + formattedText + selectedTab.notes.substring(end);

    updateTextContent(newText);
  }, [selectedTab?.notes, updateTextContent]);

  const addTabToSelectedLines = useCallback(() => {
    formatSelectedText('\t');
  }, [formatSelectedText]);

  const addSpaceToSelectedLines = useCallback(() => {
    formatSelectedText(' ');
  }, [formatSelectedText]);

  const addBulletToSelectedLines = useCallback(() => {
    formatSelectedText(' • ');
  }, [formatSelectedText]);

  const addDashToSelectedLines = useCallback(() => {
    formatSelectedText(' - ');
  }, [formatSelectedText]);

  const addPlusToSelectedLines = useCallback(() => {
    formatSelectedText(' + ');
  }, [formatSelectedText]);

  const addAsteriskToSelectedLines = useCallback(() => {
    formatSelectedText(' * ');
  }, [formatSelectedText]);

  const addNumberToSelectedLines = useCallback(() => {
    if (!selectedTab?.notes) {
      alert("No content to format");
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start === end) {
      alert("Please select text before formatting");
      return;
    }

    const selectedText = selectedTab.notes.substring(start, end);
    const lines = selectedText.split('\n');

    const formattedLines = lines.map((line, index) => {
      if (line.trim() === '') return line;

      const trimmedLine = line.trim();
      const removePattern = /^(\d+\.\s*|[a-z]\.\s*|[A-Z]\.\s*|•\s*|-\s*|\+\s*|\*\s*|→\s*|\t+|\s+)/;
      const cleanedLine = trimmedLine.replace(removePattern, '');

      return ` ${index + 1}. ${cleanedLine}`;
    });

    const formattedText = formattedLines.join('\n');
    const newText = selectedTab.notes.substring(0, start) + formattedText + selectedTab.notes.substring(end);

    updateTextContent(newText);
  }, [selectedTab?.notes, updateTextContent]);

  const searchInText = useCallback(() => {
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
  }, [searchTerm, selectedTab?.notes]);

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

    const textarea = textareaRef.current;
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

    setSearchResults([]);
    setCurrentSearchIndex(-1);
    setSearchTerm("");
    setReplaceTerm("");
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchInText();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedTab?.notes, searchInText]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey && event.key === 'f') {
        event.preventDefault();
        setShowSearchReplace(true);
        setTimeout(() => {
          const searchInput = document.querySelector('input[placeholder="Search..."]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
          }
        }, 100);
      }

      if (event.key === 'Escape' && showSearchReplace) {
        setShowSearchReplace(false);
      }

      if (event.ctrlKey && event.shiftKey) {
        const textarea = textareaRef.current;
        if (textarea && document.activeElement === textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;

          if (start !== end) {
            switch (event.key) {
              case 'T':
                event.preventDefault();
                addTabToSelectedLines();
                break;
              case 'S':
                event.preventDefault();
                addSpaceToSelectedLines();
                break;
              case 'B':
                event.preventDefault();
                addBulletToSelectedLines();
                break;
              case 'D':
                event.preventDefault();
                addDashToSelectedLines();
                break;
              case 'P':
                event.preventDefault();
                addPlusToSelectedLines();
                break;
              case 'A':
                event.preventDefault();
                addAsteriskToSelectedLines();
                break;
              case 'N':
                event.preventDefault();
                addNumberToSelectedLines();
                break;
            }
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showSearchReplace, addTabToSelectedLines, addSpaceToSelectedLines, addBulletToSelectedLines, addDashToSelectedLines, addPlusToSelectedLines, addAsteriskToSelectedLines, addNumberToSelectedLines]);

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
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const lines = text === '' ? 0 : text.split('\n').length;
    const paragraphs = text.trim() === '' ? 0 : text.split('\n').filter(line => line.trim() !== '').length;
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

  const markdownContent = useMemo(() => {
    if (!markdownMode || !selectedTab?.notes) return null;
    return selectedTab.notes;
  }, [markdownMode, selectedTab?.notes]);

  // ===== Markdown toolbar insert helpers =====
  const insertMarkdown = useCallback((type: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = selectedTab?.notes ?? "";
    const selected = text.substring(start, end);

    let before = "";
    let after = "";
    let insert = "";
    let cursorOffset = 0;

    switch (type) {
      case "bold":
        before = "**";
        after = "**";
        insert = selected || "bold text";
        break;
      case "italic":
        before = "*";
        after = "*";
        insert = selected || "italic text";
        break;
      case "heading": {
        const lineStart = text.lastIndexOf('\n', start - 1) + 1;
        const lineText = text.substring(lineStart, end);
        const headingMatch = lineText.match(/^(#{1,6})\s/);
        if (headingMatch) {
          const level = headingMatch[1].length;
          if (level >= 6) {
            const newText = text.substring(0, lineStart) + lineText.replace(/^#{1,6}\s/, '') + text.substring(end);
            updateTextContent(newText);
            textarea.focus();
            setTimeout(() => textarea.setSelectionRange(lineStart, lineStart + lineText.length - level - 1), 0);
            return;
          }
          const newText = text.substring(0, lineStart) + '#' + lineText + text.substring(end);
          updateTextContent(newText);
          textarea.focus();
          setTimeout(() => textarea.setSelectionRange(start + 1, end + 1), 0);
          return;
        }
        const prefix = "## ";
        const newText = text.substring(0, lineStart) + prefix + text.substring(lineStart);
        updateTextContent(newText);
        textarea.focus();
        setTimeout(() => textarea.setSelectionRange(start + prefix.length, end + prefix.length), 0);
        return;
      }
      case "ul": {
        if (selected) {
          const lines = selected.split('\n').map(l => l.trim() ? `- ${l.replace(/^[-*+]\s*/, '')}` : l).join('\n');
          const newText = text.substring(0, start) + lines + text.substring(end);
          updateTextContent(newText);
          textarea.focus();
          setTimeout(() => textarea.setSelectionRange(start, start + lines.length), 0);
          return;
        }
        before = "- ";
        insert = "list item";
        break;
      }
      case "ol": {
        if (selected) {
          let num = 1;
          const lines = selected.split('\n').map(l => l.trim() ? `${num++}. ${l.replace(/^\d+\.\s*/, '')}` : l).join('\n');
          const newText = text.substring(0, start) + lines + text.substring(end);
          updateTextContent(newText);
          textarea.focus();
          setTimeout(() => textarea.setSelectionRange(start, start + lines.length), 0);
          return;
        }
        before = "1. ";
        insert = "list item";
        break;
      }
      case "checklist": {
        if (selected) {
          const lines = selected.split('\n').map(l => l.trim() ? `- [ ] ${l.replace(/^[-*+]\s*(\[[ x]\]\s*)?/, '')}` : l).join('\n');
          const newText = text.substring(0, start) + lines + text.substring(end);
          updateTextContent(newText);
          textarea.focus();
          setTimeout(() => textarea.setSelectionRange(start, start + lines.length), 0);
          return;
        }
        before = "- [ ] ";
        insert = "task";
        break;
      }
      case "blockquote": {
        if (selected) {
          const lines = selected.split('\n').map(l => `> ${l}`).join('\n');
          const newText = text.substring(0, start) + lines + text.substring(end);
          updateTextContent(newText);
          textarea.focus();
          setTimeout(() => textarea.setSelectionRange(start, start + lines.length), 0);
          return;
        }
        before = "> ";
        insert = "quote";
        break;
      }
      case "code":
        if (selected && selected.includes('\n')) {
          before = "```\n";
          after = "\n```";
          insert = selected;
        } else {
          before = "`";
          after = "`";
          insert = selected || "code";
        }
        break;
      case "table":
        insert = "| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n| Cell | Cell | Cell |";
        cursorOffset = 2;
        break;
      case "link":
        before = "[";
        after = "](url)";
        insert = selected || "link text";
        break;
      case "image":
        before = "![";
        after = "](url)";
        insert = selected || "alt text";
        break;
      case "hr":
        insert = "\n---\n";
        break;
      default:
        return;
    }

    const newText = text.substring(0, start) + before + insert + after + text.substring(end);
    updateTextContent(newText);
    textarea.focus();
    const newCursorStart = start + before.length + (cursorOffset || 0);
    const newCursorEnd = newCursorStart + insert.length - (cursorOffset || 0);
    setTimeout(() => textarea.setSelectionRange(newCursorStart, newCursorEnd), 0);
  }, [selectedTab?.notes, updateTextContent]);

  // ===== Markdown keyboard shortcuts =====
  useEffect(() => {
    if (!markdownMode) return;

    function handleMdKeyDown(event: KeyboardEvent) {
      if (!event.metaKey || !event.shiftKey) return;

      const keyMap: Record<string, string> = {
        'b': 'bold',
        'i': 'italic',
        'u': 'ul',
        'o': 'ol',
        'c': 'checklist',
        'q': 'blockquote',
        'k': 'code',
        't': 'table',
        'l': 'link',
        'g': 'image',
      };

      const action = keyMap[event.key.toLowerCase()];
      if (action) {
        event.preventDefault();
        insertMarkdown(action);
      }
    }

    document.addEventListener('keydown', handleMdKeyDown);
    return () => document.removeEventListener('keydown', handleMdKeyDown);
  }, [markdownMode, insertMarkdown]);

  // Shared toolbar & panels used in both modes
  const toolbarButtons = (
    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
      <div className="flex items-center gap-1">
        <button
          onClick={() =>
            downloadFile(
              selectedTab?.file_name ?? "file name",
              selectedTab?.notes ?? ""
            )
          }
          className="px-2.5 py-1.5 text-sm hover:bg-gray-100 border border-gray-200 rounded transition-colors"
          title="Save file"
        >
          Save
        </button>
        <button
          onClick={importFile}
          className="px-2.5 py-1.5 text-sm hover:bg-gray-100 border border-gray-200 rounded transition-colors"
          title="Import file"
        >
          Import
        </button>
        <button
          onClick={backupData}
          className="px-2.5 py-1.5 text-sm hover:bg-gray-100 border border-gray-200 rounded transition-colors"
          title="Backup all tabs"
        >
          Backup
        </button>
        <button
          onClick={importBackupData}
          className="px-2.5 py-1.5 text-sm hover:bg-gray-100 border border-gray-200 rounded transition-colors"
          title="Restore from backup"
        >
          Restore
        </button>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <button
          onClick={() => setShowSearchReplace(!showSearchReplace)}
          className={`px-2.5 py-1.5 text-sm border rounded transition-colors ${showSearchReplace ? 'bg-gray-900 text-white border-gray-900' : 'hover:bg-gray-100 border-gray-200'}`}
          title="Search & Replace (Ctrl+F)"
        >
          Search
        </button>
        <button
          onClick={() => setShowStats(!showStats)}
          className={`px-2.5 py-1.5 text-sm border rounded transition-colors ${showStats ? 'bg-gray-900 text-white border-gray-900' : 'hover:bg-gray-100 border-gray-200'}`}
          title="Text statistics"
        >
          Stats
        </button>
        {!markdownMode && (
          <button
            onClick={() => setShowFormatTools(!showFormatTools)}
            className={`px-2.5 py-1.5 text-sm border rounded transition-colors ${showFormatTools ? 'bg-gray-900 text-white border-gray-900' : 'hover:bg-gray-100 border-gray-200'}`}
            title="Text formatting tools"
          >
            Format
          </button>
        )}
      </div>

      <button
        onClick={() => setMarkdownMode(!markdownMode)}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium border rounded transition-all ${
          markdownMode
            ? 'bg-black text-white border-black'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
        }`}
        title="Toggle Markdown preview"
      >
        <span className="font-bold text-xs tracking-wide">MD</span>
        <div className={`relative w-8 h-4 rounded-full transition-colors ${markdownMode ? 'bg-gray-500' : 'bg-gray-300'}`}>
          <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${markdownMode ? 'translate-x-4' : 'translate-x-0.5'}`} />
        </div>
      </button>
    </div>
  );

  const tabBar = (
    <div className="flex items-center mb-3 space-x-2">
      <div className="flex items-center space-x-1.5 overflow-x-auto w-full tab-scroll pb-1">
        {textNotesList.map((item) => (
          <div
            key={item.id}
            className={`
              min-w-28 max-w-44 flex-shrink-0
              flex space-x-1 justify-center items-center border hover:cursor-pointer pl-2.5 pr-1 py-1 rounded-sm transition-colors ${item.id === selectedTab?.id
                ? "bg-gray-50 border-black"
                : "border-gray-300 text-gray-500 hover:border-gray-400"
              }`}
          >
            <span
              onDoubleClick={() => editFileName(item)}
              onClick={() => selectTabNotes(item)}
              className="truncate w-full text-sm"
            >
              {item.file_name}
            </span>
            <button
              onClick={() => deleteTabNotes(item)}
              className="rounded-full hover:bg-gray-200 p-1.5 flex justify-center items-center flex-shrink-0"
            >
              <XMarkIcon className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={addTabNotes}
        className="rounded-full hover:bg-gray-200 p-2 flex justify-center items-center flex-shrink-0"
      >
        <PlusIcon className="w-4 h-4" />
      </button>
    </div>
  );

  const searchReplacePanel = showSearchReplace && (
    <div className="mb-3 p-3 border border-black bg-gray-50 rounded-sm">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 focus:outline-none focus:border-black rounded-sm"
          />
          <button
            onClick={prevSearchResult}
            disabled={searchResults.length === 0}
            className="px-2.5 py-1.5 text-sm bg-gray-800 text-white rounded-sm hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            ↑
          </button>
          <button
            onClick={nextSearchResult}
            disabled={searchResults.length === 0}
            className="px-2.5 py-1.5 text-sm bg-gray-800 text-white rounded-sm hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            ↓
          </button>
          <span className="text-xs text-gray-500 min-w-14 text-center">
            {searchResults.length > 0 ? `${currentSearchIndex + 1}/${searchResults.length}` : '0/0'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Replace with..."
            value={replaceTerm}
            onChange={(e) => setReplaceTerm(e.target.value)}
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 focus:outline-none focus:border-black rounded-sm"
          />
          <button
            onClick={replaceOne}
            disabled={searchResults.length === 0 || currentSearchIndex < 0}
            className="px-2.5 py-1.5 text-sm bg-gray-800 text-white rounded-sm hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Replace
          </button>
          <button
            onClick={replaceAll}
            disabled={searchResults.length === 0}
            className="px-2.5 py-1.5 text-sm bg-gray-800 text-white rounded-sm hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            All
          </button>
          <button
            onClick={() => setShowSearchReplace(false)}
            className="px-2.5 py-1.5 text-sm text-gray-500 hover:text-black"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  const statsPanel = showStats && (
    <div className="mb-3 p-3 border border-black bg-gray-50 rounded-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-gray-800">Text Statistics</h3>
        <button
          onClick={() => setShowStats(false)}
          className="text-xs text-gray-500 hover:text-black"
        >
          Close
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="bg-white p-2.5 border border-gray-200 rounded-sm">
          <div className="text-xl font-bold text-gray-900">{textStats.words.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Words</div>
        </div>
        <div className="bg-white p-2.5 border border-gray-200 rounded-sm">
          <div className="text-xl font-bold text-gray-900">{textStats.characters.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Characters</div>
        </div>
        <div className="bg-white p-2.5 border border-gray-200 rounded-sm">
          <div className="text-xl font-bold text-gray-900">{textStats.lines.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Lines</div>
        </div>
        <div className="bg-white p-2.5 border border-gray-200 rounded-sm">
          <div className="text-xl font-bold text-gray-900">{textStats.paragraphs.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Paragraphs</div>
        </div>
        <div className="bg-white p-2.5 border border-gray-200 rounded-sm">
          <div className="text-xl font-bold text-gray-900">{textStats.charactersNoSpaces.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Chars (no space)</div>
        </div>
        <div className="bg-white p-2.5 border border-gray-200 rounded-sm">
          <div className="text-xl font-bold text-gray-900">
            {textStats.readingTime} {textStats.readingTime === 1 ? 'min' : 'mins'}
          </div>
          <div className="text-xs text-gray-500">Reading time</div>
        </div>
        <div className="bg-white p-2.5 border border-gray-200 rounded-sm">
          <div className="text-xl font-bold text-gray-900">
            {textStats.words > 0 ? (textStats.characters / textStats.words).toFixed(1) : '0'}
          </div>
          <div className="text-xs text-gray-500">Avg chars/word</div>
        </div>
        <div className="bg-white p-2.5 border border-gray-200 rounded-sm">
          <div className="text-xl font-bold text-gray-900">
            {textStats.lines > 0 ? (textStats.words / textStats.lines).toFixed(1) : '0'}
          </div>
          <div className="text-xs text-gray-500">Avg words/line</div>
        </div>
      </div>
    </div>
  );

  const mdToolbarBtnClass = "px-2 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded-sm transition-colors";

  const markdownToolbar = (
    <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 border-b border-black overflow-x-auto">
      <button onClick={() => insertMarkdown('bold')} className={mdToolbarBtnClass} title="Bold (Cmd+Shift+B)"><strong>B</strong></button>
      <button onClick={() => insertMarkdown('italic')} className={mdToolbarBtnClass} title="Italic (Cmd+Shift+I)"><em>I</em></button>
      <button onClick={() => insertMarkdown('heading')} className={mdToolbarBtnClass} title="Heading">H</button>
      <div className="w-px h-4 bg-gray-300 mx-0.5" />
      <button onClick={() => insertMarkdown('ul')} className={mdToolbarBtnClass} title="Unordered list (Cmd+Shift+U)">UL</button>
      <button onClick={() => insertMarkdown('ol')} className={mdToolbarBtnClass} title="Ordered list (Cmd+Shift+O)">OL</button>
      <button onClick={() => insertMarkdown('checklist')} className={mdToolbarBtnClass} title="Check list (Cmd+Shift+C)">Check</button>
      <div className="w-px h-4 bg-gray-300 mx-0.5" />
      <button onClick={() => insertMarkdown('blockquote')} className={mdToolbarBtnClass} title="Blockquote (Cmd+Shift+Q)">Quote</button>
      <button onClick={() => insertMarkdown('code')} className={mdToolbarBtnClass} title="Code (Cmd+Shift+K)">Code</button>
      <button onClick={() => insertMarkdown('table')} className={mdToolbarBtnClass} title="Table (Cmd+Shift+T)">Table</button>
      <div className="w-px h-4 bg-gray-300 mx-0.5" />
      <button onClick={() => insertMarkdown('link')} className={mdToolbarBtnClass} title="Link (Cmd+Shift+L)">Link</button>
      <button onClick={() => insertMarkdown('image')} className={mdToolbarBtnClass} title="Image (Cmd+Shift+G)">Img</button>
      <button onClick={() => insertMarkdown('hr')} className={mdToolbarBtnClass} title="Horizontal rule">HR</button>
    </div>
  );

  const footerBar = (
    <div className="flex justify-between items-center mt-1.5">
      <span className="text-xs text-gray-400">
        {selectedTab?.date ? `Last modified: ${selectedTab.date}` : ''}
      </span>
      <div className="flex items-center gap-3 text-xs text-gray-500">
        {markdownMode && <span className="text-black font-medium">Markdown</span>}
        <span>{textStats.words} words</span>
        <span>{textStats.characters} chars</span>
        <span>{textStats.lines} lines</span>
        {textStats.readingTime > 0 && (
          <span>~{textStats.readingTime} min read</span>
        )}
      </div>
    </div>
  );

  // ===== MARKDOWN FULL-SCREEN MODE =====
  if (markdownMode) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col">
        {/* Top area */}
        <div className="px-4 pt-3 flex-shrink-0">
          {toolbarButtons}
          {tabBar}
          {searchReplacePanel}
          {statsPanel}
        </div>

        {/* Split editor */}
        <div className="flex flex-1 border-t border-black min-h-0">
          {/* Editor side */}
          <div className="w-1/2 border-r border-black flex flex-col min-h-0">
            <div className="px-3 py-1.5 bg-gray-100 border-b border-black text-xs text-gray-500 font-medium flex-shrink-0">
              EDITOR
            </div>
            {markdownToolbar}
            <textarea
              ref={textareaRef}
              onChange={editTextNotes}
              spellCheck="true"
              value={selectedTab?.notes ?? ""}
              placeholder={"Write markdown here...\n\n# Heading 1\n## Heading 2\n\n**Bold** *Italic* ~~Strikethrough~~\n\n- List item\n- [ ] Task\n\n```code block```"}
              className="flex-1 w-full outline-none p-3 text-sm font-mono resize-none"
            />
          </div>

          {/* Preview side */}
          <div className="w-1/2 flex flex-col min-h-0">
            <div className="px-3 py-1.5 bg-gray-100 border-b border-black text-xs text-gray-500 font-medium flex-shrink-0">
              PREVIEW
            </div>
            <div className="flex-1 p-4 overflow-auto prose-quicknote">
              {markdownContent ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {markdownContent}
                </ReactMarkdown>
              ) : (
                <p className="text-gray-400 text-sm italic">Markdown preview will appear here...</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-1.5 border-t border-gray-200 flex-shrink-0">
          {footerBar}
        </div>
      </div>
    );
  }

  // ===== NORMAL (PLAIN TEXT) MODE =====
  return (
    <>
      {toolbarButtons}
      {tabBar}
      {searchReplacePanel}
      {statsPanel}

      {/* Format tools - only in plain text mode */}
      {showFormatTools && (
        <div className="mb-3 p-3 border border-black bg-gray-50 rounded-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-gray-800">Text Formatting</h3>
            <button
              onClick={() => setShowFormatTools(false)}
              className="text-xs text-gray-500 hover:text-black"
            >
              Close
            </button>
          </div>

          <div className="space-y-2">
            <div>
              <div className="text-xs text-gray-400 mb-1">Case</div>
              <div className="flex flex-wrap gap-1">
                <button onClick={formatToUpperCase} className="px-2.5 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded-sm" title="UPPERCASE">UPPER</button>
                <button onClick={formatToLowerCase} className="px-2.5 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded-sm" title="lowercase">lower</button>
                <button onClick={formatToTitleCase} className="px-2.5 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded-sm" title="Title Case">Title</button>
                <button onClick={formatToSentenceCase} className="px-2.5 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded-sm" title="Sentence case">Sentence</button>
                <button onClick={formatCapitalizeLines} className="px-2.5 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded-sm" title="Capitalize lines">Cap Lines</button>
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-400 mb-1">Cleanup</div>
              <div className="flex flex-wrap gap-1">
                <button onClick={formatToParagraph} className="px-2.5 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded-sm" title="Merge to paragraph">Paragraph</button>
                <button onClick={formatRemoveExtraSpaces} className="px-2.5 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded-sm" title="Remove extra spaces">Clean</button>
                <button onClick={formatRemoveSpacing} className="px-2.5 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded-sm" title="Remove spacing">No Spacing</button>
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-400 mb-1">Line prefix (select text first)</div>
              <div className="flex flex-wrap gap-1">
                <button onClick={addTabToSelectedLines} className="px-2.5 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded-sm" title="Ctrl+Shift+T">Tab</button>
                <button onClick={addSpaceToSelectedLines} className="px-2.5 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded-sm" title="Ctrl+Shift+S">Space</button>
                <button onClick={addBulletToSelectedLines} className="px-2.5 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded-sm" title="Ctrl+Shift+B">Bullet</button>
                <button onClick={addDashToSelectedLines} className="px-2.5 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded-sm" title="Ctrl+Shift+D">Dash</button>
                <button onClick={addPlusToSelectedLines} className="px-2.5 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded-sm" title="Ctrl+Shift+P">Plus</button>
                <button onClick={addAsteriskToSelectedLines} className="px-2.5 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded-sm" title="Ctrl+Shift+A">Star</button>
                <button onClick={addNumberToSelectedLines} className="px-2.5 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded-sm" title="Ctrl+Shift+N">1. 2. 3.</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <textarea
        ref={textareaRef}
        onChange={editTextNotes}
        spellCheck="true"
        value={selectedTab?.notes ?? ""}
        placeholder="Enter content"
        rows={15}
        className="w-full outline-none border border-black p-3 min-h-[400px] text-sm font-mono resize-y"
      />

      {footerBar}
    </>
  );
};
