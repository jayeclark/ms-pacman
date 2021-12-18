// import board from './board1.json' assert { type: "json" };

export default async function loadBoards() {
  const response = await fetch('../data/board1.json');
  const board1raw = await response.text();
  const board1 = await JSON.parse(board1raw);
  return { board1 };
}
