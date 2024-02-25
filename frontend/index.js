"use Strict";
//globals
const form = document.querySelector("form");
const fileInput = document.getElementById("file--input");
const selectInput = document.getElementById("select--input");
const selectError = document.querySelector(".select--error");
const dragDrop = document.getElementById("drag-drop");
const chooseFileButton = document.querySelector(".choose-file--button");
const chooseFileIcon = document.getElementById("cloud-upload--icon");

//regex globals
const namePattern = /^UG\/\d{2}\/\d{4}_[A-Za-z]+_[A-Za-z]+$/;

//generic submsion function
const submitFile = async (url, dept, file) => {
  try {
    const response = await fetch(url + `${dept}`, {
      method: "POST",
      body: file
    });
    const data = await response.json();
    console.log(data);
  } catch (error) {}
};

//drag and drop functionality
dragDrop.addEventListener("dragover", (e) => {
  e.preventDefault();
});

dragDrop.addEventListener("drop", (e) => {
  e.preventDefault();
  console.log("dropped");
});

fileInput.addEventListener("change", () => {
  console.log(fileInput.files);
});

selectInput.addEventListener("change", () => {
  if (selectInput.value != "") {
    selectError.style.display = "none";
    selectInput.style.borderColor = "initial";
  }
});

//custom input functionality
chooseFileButton.addEventListener("click", () => {
  fileInput.click();
});
chooseFileIcon.addEventListener("click", () => {
  fileInput.click();
});

//form submision and validation
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData();
  const form = e.currentTarget;
  const submissionPath = form.action;

  if (selectInput.value == "") {
    selectError.style.display = "block";
    selectInput.style.borderColor = "red";
    return;
  }
  if (!fileInput.files[0]) {
    alert("please choose a file");
    return;
  }
  if (!namePattern.test(fileInput.files[0].name)) {
    alert("Incorrect Naming Format");
    return;
  }

  formData.append("file", fileInput.files[0]);
  submitFile(submissionPath, selectInput.value, formData);
});
