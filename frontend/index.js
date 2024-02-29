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

//regex globals
const namePattern =
  /^((UG-\d{2}-\d{4})|(\d{12}[A-Za-z]{2}))_[A-Za-z]+_[A-Za-z]+_(([1-9]\.py)|(\.mp4))$/;

let selectedFiles = [];
//generic submsion function

const submitFile = async (url, dept, file) => {
  try {
    const response = await fetch(url + `${dept}`, {
      method: "POST",
      body: file
    });
    const data = await response.json();
    console.log(data);
    if (data.error) {
      failStatus.style.display = "flex";
      failStatus.addEventListener("animationend", () => {
        failStatus.style.display = "none";
      });
    } else {
      successStatus.style.display = "flex";
      form.reset();
      filesList.replaceChildren();
      selectedFiles.splice(0);

      successStatus.addEventListener("animationend", () => {
        successStatus.style.display = "none";
      });
    }
  } catch (error) {}
};

//drag and drop functionality
dragDrop.addEventListener("dragover", (e) => {
  e.preventDefault();
});

dragDrop.addEventListener("drop", (e) => {
  e.preventDefault();

  for (let file of e.dataTransfer.files) {
    const fileType = file.type;
    if (fileType !== "text/x-python" && fileType !== "video/mp4") {
      alert("Only Python (.py) and MP4 files are allowed.");
      return; // Stop further processing if an invalid file is found
    }
  }

  // Trigger the change event with valid files
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

  // for (let inputFile of files) {
  //   // Add the file to the selectedFiles array

  //   const li = document.createElement("li");
  //   li.innerHTML = `
  //   <p class="file--name">${inputFile.name}</p>
  //   <button class="del--button" type="button">
  //     <svg
  //       data-slot="icon"
  //       fill="none"
  //       stroke-width="1.5"
  //       stroke="currentColor"
  //       viewBox="0 0 24 24"
  //       xmlns="http://www.w3.org/2000/svg"
  //       aria-hidden="true"
  //     >
  //       <path
  //         stroke-linecap="round"
  //         stroke-linejoin="round"
  //         d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
  //       ></path>
  //     </svg></button
  //   >`;

  //   switch (selectedFiles.length > 0) {
  //     case true:
  //       let fileExists = false;
  //       selectedFiles.forEach((file) => {
  //         if (file.name === inputFile.name) {
  //           fileExists = true;
  //         }
  //       });
  //       if (!fileExists) {
  //         selectedFiles.push(inputFile);
  //         filesList.appendChild(li);
  //       }
  //       break;
  //     case false:
  //       selectedFiles.push(inputFile);
  //       filesList.appendChild(li);
  //       break;
  //     default:
  //       break;
  //   }
  for (let inputFile of files) {
    const fileIndex = selectedFiles.findIndex(
      (file) => file.name === inputFile.name
    );

    if (fileIndex !== -1) {
      selectedFiles.splice(fileIndex, 1, inputFile);
    } else {
      selectedFiles.push(inputFile);

      const li = document.createElement("li");
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
  console.log(selectedFiles);
  let delButton = document.querySelectorAll(".del--button");
  delButton.forEach((button) => {
    button.addEventListener("click", () => {
      const listItem = button.parentElement;
      const fileName = listItem.querySelector(".file--name").textContent;
      const fileIndex = selectedFiles.findIndex(
        (file) => file.name === fileName
      );
      if (fileIndex !== -1) {
        selectedFiles.splice(fileIndex, 1);
        listItem.remove();
      }
    });
  });
});

selectInput.addEventListener("change", () => {
  if (selectInput.value != "") {
    selectError.style.display = "none";
    selectInput.style.borderColor = "initial";
  }
});

//form submision and validation
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData();
  const form = e.currentTarget;
  const submissionPath = form.action;
  let isValid = true;

  if (selectInput.value == "") {
    selectError.style.display = "block";
    selectInput.style.borderColor = "red";
    isValid = false;
  }

  if (selectedFiles.length == 0) {
    emptyError.style.display = "block";
    isValid = false;
  }

  if (selectedFiles.length > 0) {
    selectedFiles.forEach((file) => {
      if (!namePattern.test(file.name)) {
        namingError.style.display = "block";
        isValid = false;
      }
    });
  }

  if (isValid) {
    selectedFiles.forEach((file, index) => {
      formData.append(`file`, file);
    });
    submitFile(submissionPath, selectInput.value, formData);
  }
});
