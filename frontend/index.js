"use Strict";
//globals
const form = document.querySelector("form");
const file = document.getElementById("file--input");
const selectInput = document.getElementById("select--input");

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
//

//form submision and validation
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData();
  const form = e.currentTarget;
  const submissionPath = form.action;

  if (selectInput.value == "") {
    alert("please choose a deparment");
    return;
  }
  if (!file.files[0]) {
    alert("please choose a file");
    return;
  }
  formData.append("file", file.files[0]);
  submitFile(submissionPath, selectInput.value, formData);
});
