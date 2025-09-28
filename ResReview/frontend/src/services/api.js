export async function getHello() {
  const res = await fetch("http://localhost:8080/api/hello");
  return res.text();
}
