import express from "express";
import pythonRouter from "./routes/python";
import cors from "cors";
import cRouter from "./routes/c";

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

app.use("/api/submit/python", pythonRouter);

app.use("/api/submit/c", cRouter);

app.listen(3000, () => {
  console.log("server active");
});
