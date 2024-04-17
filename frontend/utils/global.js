"use Strict";
//globals
const form = document.querySelector("form");
const fileInput = document.getElementById("file--input");
const selectInput = document.getElementById("select--input");
const selectError = document.getElementById("select--error");
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
const highlightedSize = document.getElementById("highlightedSize");
const uploadedContainer = document.querySelector(".uploaded_files--container");

const hostname = window.location.hostname;

let selectedFiles = [];
let submittedFiles = [];
let wrongSizeFiles = [];
let failedNames = [];

dragDrop.addEventListener("dragover", (e) => {
  e.preventDefault();
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
      fileInput.value = "";
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
      const wrongSizeIndex = wrongSizeFiles.findIndex(
        (name) => name == fileName
      );
      const failedNameIndex = failedNames.findIndex((name) => name == fileName);
      if (failedNameIndex !== -1) {
        failedNames.splice(failedNameIndex, 1);
      }
      if (failedNames.length == 0) {
        namingError.style.display = "none";
      }
      if (uploadFileIndex !== -1) {
        submittedFiles.splice(uploadFileIndex, 1);
      }
      if (submittedFiles.length == 0) {
        highlighted.style.display = "none";
      }
      if (wrongSizeIndex !== -1) {
        wrongSizeFiles.splice(wrongSizeIndex, 1);
      }
      if (wrongSizeFiles.length == 0) {
        highlightedSize.style.display = "none";
      }
      if (fileIndex !== -1) {
        selectedFiles.splice(fileIndex, 1);
        listItem.remove();
      }
      console.log(failedNames, failedNameIndex);
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
        }
        if (status == "sucessful files") {
          highlighted.style.display = "block";
          listItem.style.backgroundColor = "green";
        }
        if (status == "wrong size") {
          highlightedSize.style.display = "block";
          listItem.style.backgroundColor = "blue";
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

function setTotalFileSize(size) {
  totalFileSize = size;
}

function setControler(control) {
  controller = control;
}

function setFileTracker(tracker) {
  fileTracker = tracker;
}
function setUploadedFiles(uploaded) {
  uploadedFiles = uploaded;
}
function setWrongSizeFiles(files) {
  wrongSizeFiles = files;
}
function setFailedNameFiles(files) {
  failedNames = files;
}
//unit conversion funtions{}
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
    signal: controller ? controller.signal : null,
    // timeout: 600000,
    onUploadProgress: function (progressEvent) {
      fileProgress[fileTracker.name] =
        (progressEvent.loaded * 100) / progressEvent.total;

      if (uploadedFiles > 0) {
        uploadedContainer.style.display = "flex";
      }

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
  percentDetails.firstChild.textContent = "";

  uploadedFilesDetails.firstChild.textContent = "";

  uploadedFilesDetails.children[1].textContent = "";

  uploadedFilesDetails.lastChild.textContent = "";

  uploadedContainer.style.display = "none";
};

export {
  form,
  fileInput,
  selectInput,
  selectError,
  namingError,
  emptyError,
  chooseFileButton,
  chooseFileIcon,
  filesList,
  errorList,
  successStatus,
  failStatus,
  statusContainer,
  loadingOverlay,
  percentDetails,
  progressBar,
  uploadedFilesDetails,
  submitedFilesList,
  cancelButton,
  failMessage,
  highlighted,
  hostname,
  selectedFiles,
  submittedFiles,
  dragDrop,
  failDisplay,
  successDisplay,
  fileStatus,
  overlayUpdater,
  userOrNetworkCancellation,
  uploadedFiles,
  fileProgress,
  fileTracker,
  totalFileSize,
  currentProgress,
  controller,
  sizeConverter,
  timeConverter,
  getConfig,
  clearValues,
  setTotalFileSize,
  setControler,
  setFileTracker,
  setUploadedFiles,
  uploadedContainer,
  highlightedSize,
  setWrongSizeFiles,
  setFailedNameFiles
};
