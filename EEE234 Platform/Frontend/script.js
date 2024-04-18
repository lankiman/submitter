"use strict";

//html elements globals

const sourceFileInput = document.getElementById("file--input");
const chooseFileBtn = document.getElementById("choose--file--btn");
const fileSection = document.getElementById("file--section");
const submitExamBtn = document.getElementById("submit--exam--btn");
const namingErrorDisplay = document.getElementById("naming--error");
const examSubmissionForm = document.getElementById("submit--script--form");
const submisionStatus = document.getElementById("submission--status");
const submitBtnContainer = document.getElementById("submit--btn--container");
const spinner = document.getElementById("spinner");
//host name
const hostname = window.location.hostname;

//regex pattern

const namingPattern =
  /^((UG-\d{2}-\d{4})|(\d{12}[A-Za-z]{2})|(\d{8}[A-Za-z]{2}))_[A-Z][a-z]+(-[a-zA-Z][a-z]+)?(_[A-Z][a-z]+(-[a-zA-Z][a-z]+)?){1,2}(-[a-zA-Z][a-z]+)?\.c/;

//   /^((UG-\d{2}-\d{4})|(\d{12}[A-Za-z]{2})|(\d{8}[A-Za-z]{2}))_[A-Za-z][a-z]*(-[A-Za-z][a-z]*)*_[A-Za-z][a-z]*(?:_[A-Za-z][a-z]*)?\.c$/;

//chosen file container
let choosenFile = {};

//choose file logic
chooseFileBtn.addEventListener("click", () => {
  sourceFileInput.click();
});

sourceFileInput.addEventListener("change", () => {
  const file = sourceFileInput.files[0];
  choosenFile = file;
  namingErrorDisplay.style.display = "none";
  submisionStatus.style.display = "none";

  fileSection.innerHTML = `
  <p id="file--name" class="file--name">${choosenFile.name}</p>
  <button type="button" id="file--del--btn" class="file--del--btn">
    <svg
      data-slot="icon"
      aria-hidden="true"
      fill="none"
      stroke-width="1.5"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></path>
    </svg>
  </button>
  `;
  fileSection.style.backgroundColor = "white";
  sourceFileInput.value = "";
  const deleteChoosenFilebtn = document.getElementById("file--del--btn");
  deleteChoosenFile(deleteChoosenFilebtn);
  toggleExamSubmit(choosenFile);
});

//delete choosen file function logic

const deleteChoosenFile = (deleteButton) => {
  deleteButton.addEventListener("click", () => {
    choosenFile = "";
    deleteButton.parentElement.style.background = "none";
    deleteButton.parentElement.replaceChildren();
    toggleExamSubmit(choosenFile);
    submisionStatus.style.display = "none";
    namingErrorDisplay.style.display = "none";
  });
};

//toggle submit button logic

const toggleExamSubmit = (choosenFile) => {
  if (choosenFile !== "") {
    submitBtnContainer.style.display = "flex";
  } else {
    submitBtnContainer.style.display = "none";
  }
};

//form validation logic

const validateForm = () => {
  let isValid = true;
  namingErrorDisplay.style.display = "none";

  if (!namingPattern.test(choosenFile.name)) {
    namingErrorDisplay.style.display = "flex";
    isValid = false;
  }
  return isValid;
};

//form submision logic

examSubmissionForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  submisionStatus.textContent = "";
  if (validateForm()) {
    const formData = new FormData();
    formData.append("file", choosenFile);
    spinner.style.display = "flex";

    try {
      const response = await fetch(`http://${hostname}:3000/api/exam/`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        alert("submission failed");
        throw new Error("Network response was not ok.");
      }
      const data = await response.json();
      console.log(data);

      if (data.message == "upload successful") {
        examSubmissionForm.reset();
        choosenFile = "";
        fileSection.replaceChildren();
        fileSection.style.background = "none";
        toggleExamSubmit(choosenFile);
        submisionStatus.style.display = "flex";
        submisionStatus.style.color = "GREEN";
        submisionStatus.textContent = "SUBMISSION SUCCESSFULL";
        spinner.style.display = "none";
      }
    } catch (error) {
      submisionStatus.style.display = "flex";
      submisionStatus.style.color = "red";
      submisionStatus.textContent = "SUBMISSION FAILED";
      spinner.style.display = "none";
      console.error("Error:", error);
    }
  }
});
