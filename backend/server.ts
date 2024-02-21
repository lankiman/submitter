import express from "express";
import router from "./submit";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://127.0.0.1:5500", // Allow requests only from this origin
    methods: ["POST"] // Allow only GET and POST requests
  })
);

app.use((req, res, next) => {
  console.log(req.method, req.path);

  next();
});

app.use("/api/submit", router);

app.listen(3000, () => {
  console.log("server active");
});
