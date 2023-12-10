
console.log(env);

export const Host = (env as any).production ? "https://katskit.com/guide" : "http://localhost:8080";
