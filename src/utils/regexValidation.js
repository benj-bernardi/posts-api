const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,64}$/;

export function isValidEmail(email) {
  return typeof email === "string" && emailRegex.test(email.trim());
}

export function isValidUsername(username) {
  return typeof username === "string" && usernameRegex.test(username.trim());
}

export function isValidPassword(password) {
  return typeof password === "string" && passwordRegex.test(password);
}