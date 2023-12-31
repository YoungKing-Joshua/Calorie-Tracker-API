import { Request, Response, Application } from "express";
import { User, SignUp } from "../models/user";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { verifyAuthToken } from "../middleware/auth";

dotenv.config();
const {BCRYPT_PEPPER,TOKEN_SECRET } = process.env;

const user = new User();

const index = async (req: Request, res: Response): Promise<void> => {
    try{
        await user.index().then((item) => {
            res.json(item)
        });
    } catch (error) {
        res.status(400);
        res.json(error as unknown as string);
    }
};

const show = async (req: Request, res: Response): Promise<void> => {
    try{
        await user.show(req.params.id).then((item) => {
            res.json(item)
        });
    } catch (error) {
        res.status(400);
        res.json(error as unknown as string);
    }
};

const signUp = async (req: Request, res: Response): Promise<void> => {
    const temp_user: SignUp = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      role: req. body.role,
      password: req.body.password,
    };
    try {
      await user.signUP(temp_user);
      res.send("Successfully created user");
    } catch (err) {
      res.status(400);
      res.json((err as unknown as string) + user);
    }
  };

  const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try{
        await user.delete(req.params.id).then((item) => {
            res.json(item)
        });
    } catch (error) {
        res.status(400);
        res.json(error as unknown as string);
    }
};

const login = async (req: Request, res: Response): Promise<void> => {
    try {
      await user
        .authenticate({ email: req.body.email, password: req.body.password })
        .then((item) => {
          const token = jwt.sign(
            { user: item },
            TOKEN_SECRET as unknown as string,
            { algorithm: "HS256" }
          );
          res.set("x-access-token", token);
          if (
            bcrypt.compareSync(
              req.body.password + BCRYPT_PEPPER,
              item?.password as unknown as string
            )
          ) {
            res.status(200);
            res.send(res.get("x-access-token"));
          } else {
            res.send("Could not connect");
          }
        });
    } catch (err) {
      res.status(400);
      res.json((err as unknown as string) + user);
    }
  };
  
  const user_routes = (app: Application): void => {
    app.get("/users", verifyAuthToken, index);
    app.get("/users/:id", verifyAuthToken, show);
    app.post("/users/signup", signUp);
    app.delete("/users/:id", verifyAuthToken, deleteUser);
    app.post("/users/login", login);
  };
  
  export { user_routes };