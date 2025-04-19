import { pool } from "../server/db";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createOwnerUser() {
  try {
    console.log("Checking if owner user already exists...");
    
    // Check if owner user exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE username = $1 OR email = $2",
      ["akshay", "akshaypratapsingh12345@gmail.com"]
    );
    
    if (existingUser.rows.length > 0) {
      console.log("Owner user already exists:");
      console.log(existingUser.rows[0]);
      return;
    }
    
    console.log("Creating owner user with your details...");
    
    // Hash the password
    const hashedPassword = await hashPassword("@apsc*6394#");
    
    // Create owner user with provided details
    const result = await pool.query(
      "INSERT INTO users (name, email, phone, username, password, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      ["Akshay Pratap Singh", "akshaypratapsingh12345@gmail.com", "1234567890", "akshay", hashedPassword, "owner"]
    );
    
    console.log("Owner user created successfully!");
    console.log({
      id: result.rows[0].id,
      name: result.rows[0].name,
      email: result.rows[0].email,
      username: result.rows[0].username,
      role: result.rows[0].role
    });
    console.log("You can now login with:");
    console.log("Username: akshay");
    console.log("Password: @apsc*6394#");
    
  } catch (error) {
    console.error("Error creating owner user:", error);
  } finally {
    await pool.end();
  }
}

// Run the function
createOwnerUser();