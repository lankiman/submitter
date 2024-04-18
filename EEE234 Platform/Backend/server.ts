import express from "express";
import cors from "cors";
import router from "./router";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "*", // Allow requests only from this origin
    methods: ["POST"] // Allow only GET and POST requests
  })
);

app.use((req, res, next) => {
  console.log(req.method, req.path);
  next();
});

app.use("/api/exam", router);

app.listen(3000, () => {
  console.log("server active");
});
