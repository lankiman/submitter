"use Strict";

//globals
const form = document.querySelector("form");
const fileInput = document.getElementById("file--input");
const namingError = document.getElementById("naming--error");
const emptyError = document.getElementById("empty--error");
const dragDrop = document.getElementById("drag-drop");
const chooseFileButton = document.querySelector(".choose-file--button");
const chooseFileIcon = document.getElementById("cloud-upload--icon");
const filesList = document.getElementById("files--list");
const errorList = document.querySelectorAll(".error");
const successStatus = document.getElementById("success--container");
const failStatus = document.getElementById("fail--container");
const statusContainer = document.getElementById("status--container");
const loadingOverlay = document.querySelector(".loading--overlay");
const percentDetails = document.querySelector(".details--container");
const progressBar = document.querySelector(".loading--progress");
const uploadedFilesDetails = document.querySelector(
  ".uploaded--details--container"
);
const submitedFilesList = document.querySelector(".uploaded--files--list");
const cancelButton = document.querySelector(".cancel--submission");
const failMessage = document.getElementById("fail--message");
const highlighted = document.getElementById("highlighted");

const hostname = window.location.hostname;

const namePattern =
  /^((UG-\d{2}-\d{4})|(\d{12}[A-Za-z]{2}))_[A-Za-z]+_[A-Za-z]+(?:_[A-Za-z]+)?_[1-5]\.(c|mp4)$/;

let selectedFiles = [];
let submittedFiles = [];

//drag and drop functionality
dragDrop.addEventListener("dragover", (e) => {
  e.preventDefault();
});

dragDrop.addEventListener("drop", (e) => {
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

//loading status display function

function failDisplay() {
  loadingOverlay.style.display = "none";
  statusContainer.style.display = "flex";
  failStatus.style.display = "flex";
  failStatus.addEventListener("animationend", () => {
    failStatus.style.display = "none";
    statusContainer.style.display = "none";
    if (highlighted.style.display == "block") {
      highlighted.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

function successDisplay() {
  loadingOverlay.style.display = "none";
  statusContainer.style.display = "flex";
  successStatus.style.display = "flex";
  filesList.replaceChildren();
  selectedFiles.splice(0);
  form.reset();
  successStatus.addEventListener("animationend", () => {
    successStatus.style.display = "none";
    statusContainer.style.display = "none";
  });
}

//file status determine

const fileStatus = (fileArray, status) => {
  const listItems = filesList.querySelectorAll(".selected--files");
  listItems.forEach((listItem) => {
    const fileElement = listItem.querySelector(".file--name");
    const fileButton = listItem.querySelector("button");
    if (fileElement) {
      const fileName = fileElement.textContent;
      if (fileArray.includes(fileName)) {
        if (status == "failed files") {
          listItem.style.backgroundColor = "red";
        } else {
          highlighted.style.display = "block";
          listItem.style.backgroundColor = "green";
        }
        fileElement.style.color = "white";
        fileButton.style.color = "white";
      }
    }
  });
};

const overlayUpdater = (fileName) => {
  const li = document.createElement("li");
  li.textContent = `${fileName}`;
  submitedFilesList.appendChild(li);
};

const userOrNetworkCancellation = () => {
  fileStatus(submittedFiles, "sucessful files");
};

// Axios Config

let uploadedFiles = 0;
let fileProgress = {};
let fileTracker = {};
let totalFileSize = 0;
let currentProgress = 0;

let controller;

//unit conversion funtions
const sizeConverter = (size) => {
  let units = ["bytes", "kb", "mb", "gb"];
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(2)} ${units[unitIndex]}`;
};

const timeConverter = (time) => {
  let minutes = Math.ceil(time / 60);
  let hours = Math.ceil(time / 3600);
  let remSeconds = time % 60;
  let remMinutes = minutes % 60;

  if (time >= 60 && minutes < 60) {
    return `${minutes} minutes ${Math.ceil(remSeconds)} seconds`;
  } else if (minutes >= 60) {
    return `${hours} hours ${Math.ceil(remMinutes)} minutes ${Math.ceil(
      remSeconds
    )}`;
  } else if (time < 60) {
    return `${Math.ceil(time)} seconds`;
  }
};

cancelButton.addEventListener("click", () => {
  if (controller) {
    controller.abort();
    failMessage.textContent = "Submission Cancelled";
  }
});

const getConfig = () => {
  return {
    signal: controller.signal,
    // timeout: 600000,
    onUploadProgress: function (progressEvent) {
      fileProgress[fileTracker.name] =
        (progressEvent.loaded * 100) / progressEvent.total;

      let totalSize = sizeConverter(totalFileSize);
      // sum up all file progress percentages to calculate the overall progress
      const totalPercent = fileProgress
        ? Object.values(fileProgress).reduce((sum, num) => sum + num, 0)
        : 0;

      // divide the total percentage by the number of files
      let percentCompleted = parseInt(
        Math.round(totalPercent / selectedFiles.length)
      );
      currentProgress = Math.round((percentCompleted / 100) * totalFileSize);

      let remainingData = totalFileSize - currentProgress;

      let remainingTime = remainingData / progressEvent.rate || 0;

      progressBar.setAttribute("value", percentCompleted);

      percentDetails.firstChild.textContent = `${Math.round(
        percentCompleted
      )}% uploaded`;

      percentDetails.lastChild.textContent = `${sizeConverter(
        progressEvent.rate || 0
      )}/s`;

      uploadedFilesDetails.firstChild.textContent = `${uploadedFiles} of ${selectedFiles.length} files uploaded`;

      uploadedFilesDetails.children[1].textContent = `${sizeConverter(
        currentProgress || 0
      )} of ${totalSize} Uploaded`;

      uploadedFilesDetails.lastChild.textContent = `${timeConverter(
        remainingTime
      )} remaning`;
    }
  };
};

const clearValues = () => {
  uploadedFiles = 0;
  fileTracker = {};
  fileProgress = {};
  submittedFiles = [];
  currentProgress = 0;
  progressBar.setAttribute("value", 0);
  submitedFilesList.replaceChildren();

  failMessage.textContent = "Unable to Submit";

  percentDetails.lastChild.textContent = "";

  uploadedFilesDetails.firstChild.textContent = "";

  uploadedFilesDetails.children[1].textContent = "";

  uploadedFilesDetails.lastChild.textContent = "";
};

//generic submsion function
const submitFile = async (url, dept, files) => {
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
      const response = await axios.post(url + `${dept}`, formData, config);
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
  const submissionUrl = `http://${hostname}:3000/api/submit/cplatform`;
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
    submitFile(submissionUrl, selectInput.value, selectedFiles);
  }
});
