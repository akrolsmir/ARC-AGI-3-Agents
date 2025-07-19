console.log("Hello via Bun!");

const fetchGames = async () => {
  const res = await fetch("https://three.arcprize.org/api/games", {
    method: "GET",
    headers: new Headers({
      "Content-Type": "application/json",
      "X-API-Key": process.env.ARC_API_KEY!,
    }),
  });
  console.log("api key", process.env.ARC_API_KEY);
  const data = await res.json();
  console.log("Fetched games:", data);
  return data;
};

fetchGames();
