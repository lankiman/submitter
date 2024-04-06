"use Strict";

global.dragDrop.addEventListener("drop", (e) => {
  e.preventDefault();

  for (let file of e.dataTransfer.files) {
    const fileType = file.type;
    if (
      fileType !== "text/x-c" &&
      fileType !== "video/mp4" &&
      fileType !== "text/x-h"
    ) {
      alert("Only C (.c) header (.h) and MP4 files are allowed.");
      return;
    }
  }

  fileInput.files = e.dataTransfer.files;
  fileInput.dispatchEvent(new Event("change"));
});

//custom input functionality
chooseFileButton.addEventListener("click", () => {
  fileInput.click();
});
chooseFileIcon.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", () => {
  const files = fileInput.files;
  emptyError.style.display = "none";
  namingError.style.display = "none";

  for (let inputFile of files) {
    const fileIndex = selectedFiles.findIndex(
      (file) => file.name === inputFile.name
    );

    if (fileIndex !== -1) {
      selectedFiles.splice(fileIndex, 1, inputFile);
    } else {
      selectedFiles.push(inputFile);

      const li = document.createElement("li");
      li.setAttribute("class", "selected--files");
      li.innerHTML = `
    <p class="file--name">${inputFile.name}</p>
    <button class="del--button" type="button">
      <svg
        data-slot="icon"
        fill="none"
        stroke-width="1.5"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
        ></path>
      </svg></button
    >`;
      filesList.appendChild(li);
    }
  }

  let delButton = document.querySelectorAll(".del--button");
  delButton.forEach((button) => {
    button.addEventListener("click", () => {
      const listItem = button.parentElement;
      const fileName = listItem.querySelector(".file--name").textContent;
      const fileIndex = selectedFiles.findIndex(
        (file) => file.name === fileName
      );
      const uploadFileIndex = submittedFiles.findIndex(
        (name) => name == fileName
      );
      if (uploadFileIndex !== -1) {
        submittedFiles.splice(fileIndex, 1);
      }
      if (submittedFiles.length == 0) {
        highlighted.style.display = "none";
      }
      if (fileIndex !== -1) {
        selectedFiles.splice(fileIndex, 1);
        listItem.remove();
      }
    });
  });
});

// Axios Config

let uploadedFiles = 0;
let fileProgress = {};
let fileTracker = {};
let totalFileSize = 0;
let currentProgress = 0;

let controller;

cancelButton.addEventListener("click", () => {
  if (controller) {
    controller.abort();
    failMessage.textContent = "Submission Cancelled";
  }
});

//generic submsion function
const submitFile = async (url, files) => {
  clearValues();
  loadingOverlay.style.display = "flex";
  totalFileSize = files.reduce((total, file) => total + file.size, 0);
  controller = new AbortController();
  const config = getConfig();

  const formData = new FormData();

  for (let file of files) {
    formData.append(`file`, file);
    fileTracker = file;
    try {
      const response = await axios.post(url, formData, config);
      if (response.data.message == "upload successful") {
        uploadedFiles++;
        submittedFiles.push(file.name);
        overlayUpdater(file.name);
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        userOrNetworkCancellation();
      }
      if (error.code === "ECONNABORTED") {
        failMessage.textContent = "Network Timeout";
      }
      if (error.code == "ERR_NETWORK") {
        failMessage.textContent = "Network Error";
        controller.abort();
      }
      failDisplay();
      userOrNetworkCancellation();
    }
  }
  if (uploadedFiles == files.length) {
    successDisplay();
  }
};

//form submision and validation
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const submissionUrl = `http://${hostname}:3000/api/cplatform`;
  let isValid = true;
  let failedFiles = [];
  namingError.style.display = "none";

  if (selectedFiles.length == 0) {
    emptyError.style.display = "block";
    isValid = false;
  }

  if (selectedFiles.length > 0) {
    failedFiles = selectedFiles
      .filter((file) => !namePattern.test(file.name))
      .map((file) => file.name);

    if (failedFiles.length > 0) {
      namingError.style.display = "block";
      alert(
        `Please Check the following files and name them properly:\n${failedFiles.join(
          "\n"
        )}\nThey are highlighted below`
      );
      isValid = false;
    }
  }

  fileStatus(failedFiles, "failed files");

  if (isValid) {
    alert(
      "Please keep track of the Files that are sucessfully uploaded during this process in case of any Network Interuptions"
    );
    submitFile(submissionUrl, selectedFiles);
  }
});
