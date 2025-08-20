const fs = require("fs/promises");

(
    async () => {
        // constants for the commands that are possible in the file.
        const CREATE_FILE = "create a file";
        const ADD_TO_FILE = "add to a file";
        const DELETE_FILE = "delete a file";
        const RENAME_FILE = "rename a file";
        const CONTENT_DELIMITER = "content: ";

        const createFile = async (path) => {
            let existsInFileHandle;
            try {
                // We want to check whether or not we have that file.
                // So we open the file and if it opens with errors,
                // it means that the file exists, if not we can create the file.
                existsInFileHandle = await fs.open(path, "wx")
                existsInFileHandle.close();

                return console.log(`The file path ${path} already exists`)
            } catch (e) {
                if(e.code === "EEXIST") {
                    console.log("The file that you are tring to create already exists.")
                } else {
                    console.log("An error occured while moving the file: ", e)
                }
            }
        }

        const deleteFile = async (path) => {
            try {
                await fs.unlink(path)
                return console.log("File has been deleted successfully.")
            } catch (e) {
                if(e.code === "ENOENT") {
                    console.log("The file that you are tring to delete does not exist.")
                } else {
                    console.log("An error occured while moving the file: ", e)
                }
            }
        }

        const renameFile = async (oldPath, newPath) => {
            try {
                await fs.rename(oldPath, newPath);
                console.log(`File has been renamed from ${oldPath} to ${newPath} successfully.`)
            }catch(e) {
                if(e.code === "ENOENT") {
                    console.log("The file that you are tring to rename does not exist.")
                } else {
                    console.log("An error occured while moving the file: ", e)
                }
            }
        }

        let addedContent;

        const addToFile = async (path, content) => {
            if(addedContent === content) return;
            try{
                const fileHandler = await fs.open(path, "a");
                fileHandler.write(content);
                console.log("content added to file: ", content)
                addedContent = content;
                fileHandler.close();
            } catch(e) {
                if(e.code === "ENOENT") {
                    console.log("The file that you are tring to append content to does not exist.")
                } else {
                    console.log("An error occured while moving the file: ", e)
                }
            }
        }


        // create a watcher for the current folder and looking for any changes that happened. 
        // if we give a folder name it will watch the whole folder for any changes.
        // if we give it a filename like below it will only watch changes on that file.
        const dirWatcher = fs.watch("./command.txt");

        // Open the file command is to open the file and it will return a file handle object 
        // which is using event emitter so it can listen and emit events. 
        // Remember when opening a file we have to ensure to close the file and free allocated resources.
        // The second parameter to this function is what actions you want to do in the file
        // - r -> read.
        const commandFileHandler = await fs.open("./command.txt", "r");

        // We are creating an event listener on the file handle to check for changes.
        // Remember that the events should be registered first before calling the emit.
        commandFileHandler.on("change", async () => {
            // get the stats of our file using the stat function.
            // contains multiple information like file created at, modified at, size, number of blocks, ids etc ...
            // get can use the size detail on the stats for buffer size.
            const commandFileStats = await commandFileHandler.stat();

            // Fetching the size details of the file from the stats.
            const size = commandFileStats.size;

            // Allocating to the buffer with the give file size.
            const commandFileBuff = Buffer.alloc(size);

            // The location at which we want to start filling our buffer. usually from thst start so should be 0
            const commandFileOffset = 0;

            // Length of the buffer that we created above, usually same as the size.
            const commandFileLength = commandFileBuff.byteLength;

            // The position at which to start reading the file. usually from the start so 0
            const commandFilePosition = 0;

            // we always want to read the whole content from the beginning all the way to the end.
            // and since we have added a buffer the call below will ensure to fill the buffer with data.
            await commandFileHandler.read(commandFileBuff, commandFileOffset, commandFileLength, commandFilePosition);

            // decoder with take 0's and 1's and convert them into something meaningful.
            // encoder with something meaningful and conver them into take 0's and 1's.
            // the toString method is the decoder we have in nodejs, we have to pass the optional character encoding.
            const command = commandFileBuff.toString("utf-8");

            // create a file;
            // ex: create a file <path>
            if (command.includes(CREATE_FILE)) {
                const path = command.substring(CREATE_FILE.length + 1);
                createFile(path)
            }

            // delete file
            // delete a file <path>
            if (command.includes(DELETE_FILE)) {
                const path = command.substring(DELETE_FILE.length + 1);
                deleteFile(path);
            }

            // rename file
            // rename a file <path>
            if (command.includes(RENAME_FILE)) {
                const commandInfo = command.substring(RENAME_FILE.length + 1);
                const names = commandInfo.split(" to ");
                const oldPath = names[0];
                const newPath = names[1];
                renameFile(oldPath, newPath)
            }

            // add to file
            // add to a file <path>
            if (command.includes(ADD_TO_FILE)) {
                const data = command.substring(ADD_TO_FILE.length + 1);
                const commands = data.split(" "+CONTENT_DELIMITER)
                const path = commands[0];
                const content = commands[1];
                addToFile(path, content)
            }


        })

        // looping thorugh (blocking the thread) all the files in the dir and checking for events.
        for await (const event of dirWatcher) {
            // We are checking for a specific change event.
            if (event.eventType === "change") {
                // Emitting a change event to run changes on the file handler.
                commandFileHandler.emit(event.eventType)
            }
        }
    }
)();