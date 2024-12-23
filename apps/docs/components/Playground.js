/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import BrowserOnly from '@docusaurus/BrowserOnly';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faFolderOpen, faTrashCan } from '@fortawesome/free-regular-svg-icons';
import {
  faBars,
  faChevronDown,
  faChevronRight,
  faFileCirclePlus,
  faFolder,
  faRotateRight,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as stylex from '@stylexjs/stylex';
import { WebContainer, reloadPreview } from '@webcontainer/api';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import { useDropzone } from 'react-dropzone';
import ClipLoader from 'react-spinners/ClipLoader';
import { files } from './playground-utils/files';

library.add(
  faChevronDown,
  faChevronRight,
  faFileCirclePlus,
  faTrashCan,
  faFolder,
  faFolderOpen,
  faBars,
  faRotateRight,
);

async function wcSpawn(instance, ...args) {
  const process = await instance.spawn(...args);
  process.output.pipeTo(
    new WritableStream({
      write(data) {
        console.log(data);
      },
    }),
  );
  const exitCode = await process.exit;
  if (exitCode !== 0) {
    throw new Error('Command Failed', args.join(' '));
  }
  return process;
}

async function makeWebcontainer() {
  const instance = await WebContainer.boot();
  await instance.mount(files);
  await wcSpawn(instance, 'npm', ['install']);
  return instance;
}

export default function Playground() {
  const instance = useRef(null);
  const codeChangeTimeout = useRef(null);
  const loadingTimeout = useRef(null);
  const urlRef = useRef(null);
  const previewJSFiles = useRef(null);
  const previewCSSFiles = useRef(null);
  const filesRef = useRef([
    {
      name: 'main.jsx',
      content: files.src.directory['main.jsx'].file.contents,
      isEditing: false,
    },
    {
      name: 'App.jsx',
      content: files.src.directory['App.jsx'].file.contents,
      isEditing: false,
    },
  ]);
  const [url, setUrl] = useState(null);
  let [loading, setLoading] = useState(true);
  let [color, setColor] = useState('var(--ifm-color-primary)');
  const [selectedPreviewFile, setSelectedPreviewFile] = useState(null);
  const [resetPreviewFiles, setResetPreviewFiles] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeFileIndex, setActiveFileIndex] = useState(1);
  const [editingValue, setEditingValue] = useState(null);
  const [error, setError] = useState(null);
  const [directories, setDirectories] = useState([
    { name: 'src', showFiles: true },
    { name: 'js', showFiles: false },
    { name: 'metadata', showFiles: false },
  ]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (droppedFiles) => {
      const jsxFiles = droppedFiles.filter((file) =>
        file.name.endsWith('.jsx'),
      );
      const invalidFiles = droppedFiles.filter(
        (file) => !file.name.endsWith('.jsx'),
      );

      let errorMessage = '';

      if (droppedFiles.length === 1 && invalidFiles.length === 1) {
        // single file dropped invalid
        errorMessage = 'Only .jsx files are allowed in the src directory.';
      } else if (invalidFiles.length > 0) {
        // multiple files dropped, some invalid
        const invalidFileNames = invalidFiles
          .map((file) => file.name)
          .join(', ');
        errorMessage = `The following files are invalid and were not added:\n${invalidFileNames}`;
      }

      if (errorMessage) {
        alert(errorMessage);
      }

      if (jsxFiles.length === 0) {
        return;
      }

      const containerInstance = instance.current;

      for (const file of jsxFiles) {
        const reader = new FileReader();

        const fileContent = await new Promise((resolve, reject) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = (err) => reject(err);
          reader.readAsText(file);
        });

        const filesLength = filesRef.current.length;
        const newFileName = file.name || `file${filesLength + 1}`;
        const newFile = { name: newFileName, content: fileContent };

        filesRef.current.push(newFile);

        await containerInstance.fs.writeFile(
          `./src/${newFileName}`,
          fileContent,
        );

        setActiveFileIndex(filesLength);

        console.log(`File added to src: ${newFileName}`);
        console.log(`File content: ${fileContent}`); // debugging
      }
    },
    noDragEventsBubbling: true,
    noClick: true,
  });

  const handleSelectedPreviewFile = (fileName, index) => {
    setActiveFileIndex(null);
    const content = fileName.includes('.json')
      ? previewCSSFiles.current.contents[index]
      : previewJSFiles.current.contents[index];
    setSelectedPreviewFile({ file: fileName, index, content });
  };

  const handlePreviewFiles = async (removeFile = null) => {
    // retrieves generated preview files inside the 'js' and 'metadata' directories
    // if a file is removed it also removes the associated preview files
    // NOTE: the current vite setup does not generate any preview files
    try {
      const jsFiles = await getPreviewFiles('js');
      const cssFiles = await getPreviewFiles('metadata');
      previewJSFiles.current = jsFiles;
      previewCSSFiles.current = cssFiles;
    } catch (error) {
      console.error(`Failed to retrieve preview files.\n${error.message}`);
    }

    async function getPreviewFiles(dirName) {
      const containerInstance = instance.current;
      const files = await containerInstance.fs.readdir(`./previews/${dirName}`);
      const validFiles = removeFile
        ? files.filter((fileName) => !fileName.includes(removeFile))
        : files;
      const contentsPromises = validFiles.map((fileName) =>
        containerInstance.fs.readFile(
          `./previews/${dirName}/${fileName}`,
          'utf-8',
        ),
      );
      const contents = await Promise.all(contentsPromises);

      if (removeFile) {
        for (const fileName of files) {
          if (fileName.includes(removeFile)) {
            await containerInstance.fs.rm(`./previews/${dirName}/${fileName}`);
            break;
          }
        }
      }

      return { files: validFiles, contents };
    }
  };

  const enableEditMode = (index) => {
    if (!url) return;
    filesRef.current[index].isEditing = true;
    setEditingValue(filesRef.current[index].name);
  };

  const disableEditMode = async (index) => {
    filesRef.current[index].isEditing = false;
    const newFilename = editingValue;
    const oldFilename = filesRef.current[index].name;

    if (!editingValue || oldFilename === newFilename) {
      setEditingValue(null);
      return;
    }

    for (const file of filesRef.current) {
      if (file.name === newFilename) {
        setEditingValue(null);
        return alert('File already exists.');
      }
    }

    const containerInstance = instance.current;
    containerInstance.fs.rm(`./src/${oldFilename}`);
    containerInstance.fs.writeFile(
      `./src/${newFilename}`,
      filesRef.current[index].content,
    );
    filesRef.current[index].name = newFilename;
    await handlePreviewFiles(oldFilename);
    setEditingValue(null);
  };

  const toggleDirectory = (index) => {
    setDirectories((prevDirectories) =>
      prevDirectories.map((dir, i) =>
        i === index ? { ...dir, showFiles: !dir.showFiles } : dir,
      ),
    );
  };

  const addFile = async () => {
    if (!url) return;
    const containerInstance = instance.current;
    const filesLength = filesRef.current.length;
    const newFile = { name: `file${filesLength + 1}`, content: '' };
    filesRef.current.push(newFile);
    await containerInstance.fs.writeFile(`./src/file${filesLength + 1}`, '');
    setActiveFileIndex(filesLength);
  };
  const renameFile = (newName) => {
    if (!url) return;
    setEditingValue(newName);
  };

  const deleteFile = async (index) => {
    if (!url) return;

    if (filesRef.current.length === 1)
      return alert('At least one file must remain.');

    const containerInstance = instance.current;
    const fileName = filesRef.current[index].name;
    const filePath = `./src/${fileName}`;
    const updatedFiles = filesRef.current.filter((_, i) => i !== index);

    filesRef.current = updatedFiles;
    await containerInstance.fs.rm(filePath);
    await handlePreviewFiles(fileName);

    if (index === activeFileIndex && index > 0) {
      setActiveFileIndex((prev) => prev - 1);
    } else if (activeFileIndex > updatedFiles.length - 1) {
      setActiveFileIndex(updatedFiles.length - 1);
    } else {
      setResetPreviewFiles((prev) => !prev);
    }
  };

  const handleCodeChange = (updatedCode) => {
    if (!url) return;

    if (
      selectedPreviewFile ||
      updatedCode === filesRef.current[activeFileIndex].content
    )
      return;

    if (codeChangeTimeout.current) {
      clearTimeout(codeChangeTimeout.current);
      codeChangeTimeout.current = null;
    }

    if (filesRef.current[activeFileIndex]) {
      filesRef.current[activeFileIndex] = {
        ...filesRef.current[activeFileIndex],
        content: updatedCode,
      };
    }

    codeChangeTimeout.current = setTimeout(async () => {
      try {
        await updateFiles();
        await handlePreviewFiles();
      } catch (error) {
        console.error(`Failed to update files.\n${error.message}`);
      }

      async function updateFiles() {
        const containerInstance = instance.current;
        const updateFilesPromise = filesRef.current.map(({ name, content }) => {
          containerInstance.fs.writeFile(`./src/${name}`, content);
        });
        await Promise.all(updateFilesPromise);
      }
    }, 1000);
  };

  const build = async () => {
    const containerInstance = instance.current;
    if (!containerInstance) {
      setError(
        'WebContainer failed to load. Please try reloading or use a different browser.',
      );
      return;
    }

    console.log('Trying to run `npm run dev`...');
    const process = await containerInstance.spawn('npm', ['run', 'dev']);
    console.log('Spawned `npm run dev`...');
    process.output.pipeTo(
      new WritableStream({
        write(data) {
          console.log(data);
        },
      }),
    );

    console.log('Waiting for server-ready event...');
    containerInstance.on('server-ready', async (port, url) => {
      console.log('server-ready', port, url);
      urlRef.current = url;
      await handlePreviewFiles();
      setUrl(urlRef.current);
    });
  };

  const reloadContainerPreview = async () => {
    if (!url) return;
    try {
      const iframe = document.querySelector('iframe');
      if (!iframe.src.includes(urlRef.current)) {
        throw new Error('Cannot reload preview due to invalid iframe.');
      }
      if (error) setError(null);
      await reloadPreview(iframe);
    } catch (error) {
      console.error(`Error reloading preview: ${error.message}`);
      setError(
        'WebContainer failed to load. Please try reloading or use a different browser.',
      );
    }
  };

  useEffect(() => {
    require('codemirror/mode/javascript/javascript');
    makeWebcontainer().then((i) => {
      instance.current = i;
      build().then(() => {
        loadingTimeout.current = setTimeout(() => {
          const iframe = document.querySelector('iframe');
          if (!urlRef.current || !iframe.src.includes(urlRef.current)) {
            setError(
              'WebContainer failed to load. Please try reloading or use a different browser.',
            );
          }
        }, 10000);
      });
    });
    () => {
      instance.current.unmount();
      if (codeChangeTimeout.current) {
        clearTimeout(codeChangeTimeout.current);
      }
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
      }
    };
  }, []);

  return (
    <div {...stylex.props(styles.root)}>
      <header {...stylex.props(styles.header)}>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          {...stylex.props(styles.headerBtn)}
        >
          <FontAwesomeIcon icon="fa-solid fa-bars" />
        </button>
        <button {...stylex.props(styles.headerBtn)}>
          <FontAwesomeIcon
            onClick={reloadContainerPreview}
            icon="fa-solid fa-rotate-right"
          />
        </button>
      </header>

      <div
        {...stylex.props(styles.container)}
        onClick={() => setIsSidebarOpen(false)}
      >
        {isSidebarOpen && (!url || error) && (
          <div {...stylex.props(styles.loading)}>
            <ClipLoader
              loading={loading}
              color={color}
              size={50}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          </div>
        )}
        {isSidebarOpen && url && !error && (
          <div
            {...stylex.props(styles.sidebar)}
            onClick={(e) => e.stopPropagation()}
          >
            {directories.map((directory, dirIndex) => (
              <div key={dirIndex} {...stylex.props(styles.directory)}>
                <div
                  {...stylex.props(styles.directoryName)}
                  onClick={() => toggleDirectory(dirIndex)}
                >
                  <span {...stylex.props(styles.arrow)}>
                    {directory.showFiles ? (
                      <FontAwesomeIcon
                        icon="fa-solid fa-chevron-down"
                        style={{ fontSize: '12px' }}
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon="fa-solid fa-chevron-right"
                        style={{ fontSize: '12px' }}
                      />
                    )}
                  </span>
                  <span {...stylex.props(styles.folderIcon)}>
                    {directory.showFiles ? (
                      <FontAwesomeIcon icon="fa-regular fa-folder-open" />
                    ) : (
                      <FontAwesomeIcon icon="fa-solid fa-folder" />
                    )}
                  </span>
                  <span {...stylex.props(styles.directoryText)}>
                    {directory.name}
                  </span>
                  {directory.name === 'src' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addFile();
                      }}
                      {...stylex.props(styles.addFileButton)}
                    >
                      <FontAwesomeIcon
                        icon="fa-solid fa-file-circle-plus"
                        style={{ fontSize: '14px' }}
                      />
                    </button>
                  )}
                </div>
                {directory.showFiles && directory.name === 'src' && (
                  <div
                    {...getRootProps()}
                    {...stylex.props([
                      styles.tabList,
                      isDragActive && styles.dragActive,
                    ])}
                  >
                    <input {...getInputProps()} />
                    {filesRef.current.map((file, index) => (
                      <div
                        key={index}
                        {...stylex.props([
                          styles.tab,
                          activeFileIndex === index && styles.activeTab,
                        ])}
                        onClick={() => {
                          setSelectedPreviewFile(null);
                          setActiveFileIndex(index);
                        }}
                        onDoubleClick={() => enableEditMode(index)}
                      >
                        {file.isEditing ? (
                          <input
                            type="text"
                            value={editingValue}
                            onChange={(e) => renameFile(e.target.value)}
                            onBlur={() => disableEditMode(index)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') disableEditMode(index);
                            }}
                            {...stylex.props([
                              styles.tabInput,
                              activeFileIndex === index && styles.editingInput,
                            ])}
                          />
                        ) : (
                          <input
                            value={file.name}
                            readOnly={true}
                            onDoubleClick={() => enableEditMode(index)}
                            {...stylex.props(styles.tabInput)}
                          />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFile(index);
                          }}
                          {...stylex.props(styles.deleteButton)}
                        >
                          <FontAwesomeIcon
                            icon="fa-regular fa-trash-can"
                            style={{ fontSize: '16px' }}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {directory.showFiles && directory.name === 'js' && (
                  <div {...stylex.props(styles.tabList)}>
                    {previewJSFiles.current?.files.map((file, index) => (
                      <div
                        key={index}
                        onClick={() => handleSelectedPreviewFile(file, index)}
                        {...stylex.props([
                          styles.tab,
                          selectedPreviewFile?.file === file &&
                            selectedPreviewFile?.index === index &&
                            styles.activeTab,
                        ])}
                      >
                        <span {...stylex.props(styles.tabInput)}>{file}</span>
                      </div>
                    ))}
                  </div>
                )}
                {directory.showFiles && directory.name === 'metadata' && (
                  <div {...stylex.props(styles.tabList)}>
                    {previewCSSFiles.current?.files.map((file, index) => (
                      <div
                        key={index}
                        onClick={() => handleSelectedPreviewFile(file, index)}
                        {...stylex.props([
                          styles.tab,
                          selectedPreviewFile?.file === file &&
                            selectedPreviewFile?.index === index &&
                            styles.activeTab,
                        ])}
                      >
                        <span {...stylex.props(styles.tabInput)}>{file}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <BrowserOnly>
          {() => (
            <>
              <div {...stylex.props(styles.editorSection)}>
                {selectedPreviewFile && (
                  <CodeMirror
                    {...stylex.props(styles.editor)}
                    options={{
                      mode: 'javascript',
                      theme: 'material-darker',
                      lineNumbers: true,
                      readOnly: true,
                    }}
                    value={selectedPreviewFile.content}
                  />
                )}
                {!selectedPreviewFile && (
                  <CodeMirror
                    {...stylex.props(styles.editor)}
                    onChange={(editor, data, value) => handleCodeChange(value)}
                    options={{
                      mode: 'javascript',
                      theme: 'material-darker',
                      lineNumbers: true,
                    }}
                    value={filesRef.current[activeFileIndex].content || ''}
                  />
                )}
              </div>

              <div {...stylex.props(styles.previewSection)}>
                {error ? (
                  <div {...stylex.props(styles.webContainer)}>{error}</div>
                ) : url ? (
                  <iframe {...stylex.props(styles.preview)} src={url} />
                ) : (
                  <div {...stylex.props(styles.webContainer)}>
                    Starting WebContainer...
                  </div>
                )}
              </div>
            </>
          )}
        </BrowserOnly>
      </div>
    </div>
  );
}

const styles = stylex.create({
  root: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg1)',
  },
  header: {
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: '20px',
    paddingLeft: '20px',
    backgroundColor: 'var(--ifm-background-color)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
    zIndex: 20,
  },
  icon: {
    fill: 'currentColor',
  },
  headerBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    color: 'var(--fg1)',
    width: '32px',
    height: '32px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    zIndex: 20,
    padding: '4px',
    transition: 'background-color 200ms, transform 150ms',
    ':hover': {
      backgroundColor: 'var(--ifm-color-primary-light)',
      transform: 'scale(1.05)',
    },
  },
  container: {
    display: 'flex',
    width: '100%',
    height: 'calc(100vh - 40px)',
    position: 'relative',
    backgroundColor: 'var(--playground-container-bg)',
  },
  sidebar: {
    position: 'relative',
    width: '225px',
    height: '100%',
    backgroundColor: 'var(--playground-sidebar-bg)',
    color: 'var(--sidebar-fg)',
    marginRight: '3px',
    overflowY: 'auto',
    zIndex: 10,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  },
  addFileButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '10px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    ':hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
  },
  folderIcon: {
    width: '24px',
    display: 'flex',
    justifyContent: 'center',
    marginLeft: '1px',
  },
  directory: {
    marginBottom: '4px',
    width: '100%',
  },
  directoryName: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '4px 10px',
    fontSize: '14px',
    fontWeight: 'bold',
    width: '100%',
    cursor: 'pointer',
    borderRadius: '4px',
    backgroundColor: 'var(--ifm-background-color)',
    color: 'var(--ifm-font-color-base)',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
  },
  arrow: {
    width: '20px',
    display: 'flex',
    justifyContent: 'center',
  },
  directoryText: {
    marginLeft: '8px',
    textAlign: 'left',
    flex: 1,
  },
  tabList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    paddingLeft: '16px',
    marginTop: '4px',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '4px 10px',
    height: '32px',
    backgroundColor: 'var(--ifm-background-color)',
    borderRadius: '4px',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background-color 200ms, color 200ms, transform 150ms',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    ':hover': {
      backgroundColor: 'var(--ifm-color-primary)',
      color: '#FFFFFF',
      transform: 'scale(1.03)',
      opacity: '1',
    },
  },
  activeTab: {
    backgroundColor: 'var(--ifm-color-primary)',
    color: '#FFFFFF',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
  },
  tabInput: {
    flex: '1',
    backgroundColor: 'transparent',
    color: 'inherit',
    border: 'none',
    fontSize: '14px',
    padding: '2px 4px',
    borderRadius: '2px',
    outline: 'none',
    maxWidth: 'calc(100% - 32px)',
  },
  editingInput: {
    border: '1px solid var(--ifm-color-primary)',
    cursor: 'text',
    backgroundColor: '#FFFFFF',
    color: 'black',
  },
  deleteButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '10px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    ':hover': {
      opacity: '1',
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
  },
  editorSection: {
    width: '45%',
    height: '100%',
    overflow: 'auto',
    borderRight: '1px solid var(--ifm-toc-border-color)',
    backgroundColor: 'var(--playground-sidebar-bg)',
  },
  editor: {
    height: '100%',
    backgroundColor: 'var(--playground-sidebar-bg)',
  },
  previewSection: {
    width: '55%',
    height: '100%',
    backgroundColor: 'var(--playground-sidebar-bg)',
  },
  preview: {
    width: '100%',
    height: '100%',
    border: 'none',
    backgroundColor: '#ffffff',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '225px',
    borderWidth: 0,
    borderStyle: 'none',
    backgroundColor: 'var(--ifm-background-color)',
  },
  webContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: 'var(--sidebar-fg)',
    fontSize: '16px',
    backgroundColor: 'var(--ifm-background-color)',
  },
  dragActive: {
    border: '2px dashed var(--ifm-color-primary)',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
});
