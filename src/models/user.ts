import { connection } from "../routes/pgConnection";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();
const { BCRYPT_PEPPER, SALT_ROUNDS } = process.env;

export type SignUp ={
    id?:  number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    password: string;
}


export type SignIn = {
    id?:  number;
    email: string;
    password: string;
}

export class User {
    pepper: string;
    salt: string;
    constructor() {
        this.pepper = BCRYPT_PEPPER as unknown as string;
        this.salt = SALT_ROUNDS as unknown as string;
    }

    async index(): Promise<SignUp[]> {
        const conn = connection();
        await conn.connect();
        const sql = "SELECT * FROM users";
        const result = await conn.query(sql);
        return result.rows;
    }

    async show(id: string): Promise<SignUp[]> {
        const conn = connection();
        await conn.connect();
        const sql = "SELECT * FROM users WHERE id=($1)";
        const result = await conn.query(sql, [id]);
        conn.end();
        return result.rows;
    }

    async signUP(signUp: SignUp): Promise<SignUp[]>{
        try{
            const conn = connection();
            await conn.connect();
            const sql = "INSERT INTO  users (first_name, last_name,email, password) VALUES ($1, $2, $3, $4)";
            const hash = await bcrypt.hash(
                signUp.password + this.pepper,
                parseInt(this.salt)
            );
            await conn.query(sql, [
                signUp.first_name,
                signUp.last_name,
                signUp.email,
                signUp.role,
                hash,
            ]);
            const output = await conn.query ("SELECT * FROM users WHERE email=($1)", [
            signUp.email,
            ]);
            conn.end();
            return output.rows;
        } catch (err) {
            throw new Error(`Could not SignUp User. Error: ${err}`)
        }        
        }

    async signIn(signIn: SignIn): Promise<SignIn[]> {
        try {
            const conn = connection();
            await conn.connect();
            const sql = "SELECT email, password FROM users WHERE email=($1) AND password=($2)";
            const result = await conn.query(sql, [signIn.email, signIn.password]);
            conn.end();
            return result.rows;
        } catch (err) {
            throw new Error(`Could not get user account. Error: ${err}`);
        }
        }
        
    async authenticate(auth: SignIn): Promise<SignIn | null> {
        const conn = connection();
        await conn.connect();
        const sql = "SELECT email,password from users WHERE email=($1)";
        const result = await conn.query(sql, [auth.email]);
        conn.end();
        console.log(result.rows[0]);
        if (result.rows.length) {
            const user = result.rows[0];
            console.log(user);
            return user;
        }
        return null
    }
    async delete(id: string): Promise<SignUp[]> {
        const conn = connection();
        await conn.connect();
        const sql = "DELETE FROM users WHERE id=($1)";
        await conn.query(sql, [id]);
        const output = await conn.query("SELECT * FROM users");
        conn.end();
        return output.rows;
      }        
};