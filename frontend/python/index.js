//drag and drop functionality
import * as global from "../utils/global.js";

const namePattern =
  /^((UG-\d{2}-\d{4})|(\d{12}[A-Za-z]{2})|(\d{8}[A-Za-z]{2}))_[A-Za-z]+_[A-Za-z]+(?:_[A-Za-z]+)?_[1-9]\.(py|mp4)$/;

global.dragDrop.addEventListener("drop", (e) => {
  e.preventDefault();

  for (let file of e.dataTransfer.files) {
    const fileType = file.type;
    if (fileType !== "text/x-python" && fileType !== "video/mp4") {
      alert("Only Python (.py) and MP4 files are allowed.");
      return;
    }
  }

  global.fileInput.files = e.dataTransfer.files;
  global.fileInput.dispatchEvent(new Event("change"));
});

if (global.selectInput) {
  global.selectInput.addEventListener("change", () => {
    if (global.selectInput.value != "") {
      global.selectError.style.display = "none";
      global.selectInput.style.borderColor = "initial";
    }
  });
}

//generic submsion function
const submitFile = async (url, dept, files) => {
  global.clearValues();
  global.loadingOverlay.style.display = "flex";
  global.setTotalFileSize(files.reduce((total, file) => total + file.size, 0));
  global.setControler(new AbortController());
  const config = global.getConfig();

  const formData = new FormData();

  for (let file of files) {
    formData.append(`file`, file);
    global.setFileTracker(file);
    try {
      const response = await axios.post(url + `${dept}`, formData, config);
      if (response.data.message == "upload successful") {
        global.setUploadedFiles(global.uploadedFiles + 1);
        global.submittedFiles.push(file.name);
        global.overlayUpdater(file.name);
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        global.userOrNetworkCancellation();
      }
      if (error.code === "ECONNABORTED") {
        global.failMessage.textContent = "Network Timeout";
      }
      if (error.code == "ERR_NETWORK") {
        global.failMessage.textContent = "Network Error";
        global.controller.abort();
      }
      global.failDisplay();
      global.userOrNetworkCancellation();
    }
  }
  if (global.uploadedFiles == files.length) {
    global.successDisplay();
  }
};

//form submision and validation
global.form.addEventListener("submit", (e) => {
  e.preventDefault();
  const submissionUrl = `http://${global.hostname}:3000/api/submit/python/`;
  let isValid = true;
  let failedFiles = [];
  global.namingError.style.display = "none";

  if (global.selectInput) {
    if (global.selectInput.value == "") {
      global.selectError.style.display = "block";
      global.selectInput.style.borderColor = "red";
      alert("Please Choose a Department");
      global.selectInput.scrollIntoView({ behavior: "smooth", block: "start" });
      isValid = false;
    }
  }

  if (global.selectedFiles.length == 0) {
    global.emptyError.style.display = "block";
    isValid = false;
  }

  if (global.selectedFiles.length > 0) {
    failedFiles = global.selectedFiles
      .filter((file) => !namePattern.test(file.name))
      .map((file) => file.name);

    if (failedFiles.length > 0) {
      global.namingError.style.display = "block";
      alert(
        `Please Check the following files and name them properly:\n${failedFiles.join(
          "\n"
        )}\nThey are highlighted below`
      );
      isValid = false;
    }
  }

  global.fileStatus(failedFiles, "failed files");

  if (isValid) {
    alert(
      "Please keep track of the Files that are sucessfully uploaded during this process in case of any Network Interuptions"
    );
    submitFile(submissionUrl, global.selectInput.value, global.selectedFiles);
  }
});
