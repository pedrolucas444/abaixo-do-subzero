const STORAGE_KEY = "abaixo-do-subzero:v2";

const lolRanks = [
  "Ferro IV", "Ferro III", "Ferro II", "Ferro I",
  "Bronze IV", "Bronze III", "Bronze II", "Bronze I",
  "Prata IV", "Prata III", "Prata II", "Prata I",
  "Ouro IV", "Ouro III", "Ouro II", "Ouro I",
  "Platina IV", "Platina III", "Platina II", "Platina I",
  "Esmeralda IV", "Esmeralda III", "Esmeralda II", "Esmeralda I",
  "Diamante IV", "Diamante III", "Diamante II", "Diamante I",
  "Mestre", "Grão-Mestre", "Desafiante"
];

const valRanks = [
  "Ferro 1", "Ferro 2", "Ferro 3", "Bronze 1", "Bronze 2", "Bronze 3",
  "Prata 1", "Prata 2", "Prata 3", "Ouro 1", "Ouro 2", "Ouro 3",
  "Platina 1", "Platina 2", "Platina 3", "Diamante 1", "Diamante 2", "Diamante 3",
  "Ascendente 1", "Ascendente 2", "Ascendente 3", "Imortal 1", "Imortal 2", "Imortal 3", "Radiante"
];

const reference = {
  riotId: "fr0sty#BR4",
  currentRank: "Diamante I",
  currentLp: 75,
  peakRank: "Mestre",
  peakLp: 217,
  valPeak: "Imortal 1"
};

const defaults = {
  nickname: "Rival",
  riotId: "Jogador#BR1",
  lolCurrent: "Ouro II",
  lolCurrentLp: 40,
  lolPeak: "Platina III",
  lolPeakLp: 20,
  valCurrent: "Prata 3",
  valPeak: "Ouro 2",
  gcLevel: 10
};

function loadPlayer() {
  try {
    return { ...defaults, ...(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}) };
  } catch {
    return { ...defaults };
  }
}

let player = loadPlayer();

function fillSelect(select, options, selected) {
  select.replaceChildren(...options.map((label) => {
    const option = document.createElement("option");
    option.value = label;
    option.textContent = label;
    option.selected = label === selected;
    return option;
  }));
}

function rankScore(rank, lp) {
  const numericLp = Math.max(0, Number(lp) || 0);
  if (rank === "Mestre") return 2800 + numericLp;
  if (rank === "Grão-Mestre") return 4000 + numericLp;
  if (rank === "Desafiante") return 6000 + numericLp;
  const index = Math.max(0, lolRanks.indexOf(rank));
  return index * 100 + Math.min(numericLp, 99);
}

function percentOf(score, target) {
  return Math.max(0, Math.round((score / Math.max(target, 1)) * 100));
}

function valRankScore(rank) {
  return Math.max(1, valRanks.indexOf(rank) + 1);
}

function formatRank(rank, lp) {
  return `${rank} · ${Math.max(0, Number(lp) || 0)} LP`;
}

function comparisonCopy(percent, context) {
  if (percent >= 110) return `Você ultrapassou essa referência em ${percent - 100}%.`;
  if (percent >= 100) return "Você alcançou ou superou essa referência.";
  if (percent >= 95) return "Praticamente o mesmo patamar competitivo.";
  if (context === "peak") return `Seu melhor momento chegou a ${percent}% do pico do fr0sty.`;
  return `Você está a ${100 - percent}% de igualar a referência atual.`;
}

function valComparisonCopy(percent) {
  if (percent >= 110) return `Seu pico ultrapassou Imortal 1 em ${percent - 100}%.`;
  if (percent >= 100) return "Você alcançou ou superou o pico do fr0sty no VALORANT.";
  if (percent >= 95) return "Praticamente o mesmo patamar no VALORANT.";
  return `Seu pico no VALORANT chegou a ${percent}% de Imortal 1.`;
}

function verdict(currentPercent, peakPercent, valPeakPercent) {
  const reached = [currentPercent, peakPercent, valPeakPercent].filter((value) => value >= 100).length;
  if (reached === 3) return "Acima das três referências. O placar geral virou contra o Subzero.";
  if (reached === 2) return "Duas referências alcançadas. A disputa já está muito equilibrada.";
  if (reached === 1) return "Uma referência alcançada. Os outros dois placares ainda decidem a disputa.";
  if ((currentPercent + peakPercent + valPeakPercent) / 3 >= 85) return "A diferença geral é curta. Uma boa sequência muda o placar.";
  return "Ainda abaixo da referência. A régua continua com o Subzero.";
}

function render() {
  const currentScore = rankScore(player.lolCurrent, player.lolCurrentLp);
  const peakScore = rankScore(player.lolPeak, player.lolPeakLp);
  const referenceCurrent = rankScore(reference.currentRank, reference.currentLp);
  const referencePeak = rankScore(reference.peakRank, reference.peakLp);
  const currentPercent = percentOf(currentScore, referenceCurrent);
  const peakPercent = percentOf(peakScore, referencePeak);
  const valPeakPercent = percentOf(valRankScore(player.valPeak), valRankScore(reference.valPeak));
  const above = currentPercent >= 100 || peakPercent >= 100 || valPeakPercent >= 100;

  document.querySelector("#resultName").textContent = player.nickname || "Sem nome";
  document.querySelector("#resultRiot").textContent = player.riotId || "Riot ID não informado";
  document.querySelector("#avatar").textContent = (player.nickname || "?").trim().charAt(0).toUpperCase();
  document.querySelector("#resultLol").textContent = formatRank(player.lolCurrent, player.lolCurrentLp);
  document.querySelector("#resultVal").textContent = `${player.valCurrent} · pico ${player.valPeak}`;
  document.querySelector("#resultGc").textContent = `Nível ${player.gcLevel}`;
  document.querySelector("#currentPercent").textContent = `${currentPercent}%`;
  document.querySelector("#peakPercent").textContent = `${peakPercent}%`;
  document.querySelector("#valPeakPercent").textContent = `${valPeakPercent}%`;
  document.querySelector("#currentBar").style.width = `${Math.min(currentPercent, 100)}%`;
  document.querySelector("#peakBar").style.width = `${Math.min(peakPercent, 100)}%`;
  document.querySelector("#valPeakBar").style.width = `${Math.min(valPeakPercent, 100)}%`;
  document.querySelector("#playerCurrentCaption").textContent = formatRank(player.lolCurrent, player.lolCurrentLp);
  document.querySelector("#playerPeakCaption").textContent = formatRank(player.lolPeak, player.lolPeakLp);
  document.querySelector("#playerValPeakCaption").textContent = player.valPeak;
  document.querySelector("#currentCopy").textContent = comparisonCopy(currentPercent, "current");
  document.querySelector("#peakCopy").textContent = comparisonCopy(peakPercent, "peak");
  document.querySelector("#valPeakCopy").textContent = valComparisonCopy(valPeakPercent);
  document.querySelector("#verdict").textContent = verdict(currentPercent, peakPercent, valPeakPercent);

  const status = document.querySelector("#overallStatus");
  status.textContent = above ? "Na referência ou acima" : "Abaixo da referência";
  status.classList.toggle("above", above);
}

function hydrate() {
  fillSelect(document.querySelector("#lolCurrent"), lolRanks, player.lolCurrent);
  fillSelect(document.querySelector("#lolPeak"), lolRanks, player.lolPeak);
  fillSelect(document.querySelector("#valCurrent"), valRanks, player.valCurrent);
  fillSelect(document.querySelector("#valPeak"), valRanks, player.valPeak);
  document.querySelector("#nickname").value = player.nickname;
  document.querySelector("#riotId").value = player.riotId;
  document.querySelector("#lolCurrentLp").value = player.lolCurrentLp;
  document.querySelector("#lolPeakLp").value = player.lolPeakLp;
  document.querySelector("#gcLevel").value = player.gcLevel;
  document.querySelector("#gcOutput").value = player.gcLevel;
}

let toastTimer;
function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
}

const gcLevel = document.querySelector("#gcLevel");
gcLevel.addEventListener("input", () => {
  document.querySelector("#gcOutput").value = gcLevel.value;
});

document.querySelector("#playerForm").addEventListener("submit", (event) => {
  event.preventDefault();
  player = {
    nickname: document.querySelector("#nickname").value.trim(),
    riotId: document.querySelector("#riotId").value.trim(),
    lolCurrent: document.querySelector("#lolCurrent").value,
    lolCurrentLp: Number(document.querySelector("#lolCurrentLp").value),
    lolPeak: document.querySelector("#lolPeak").value,
    lolPeakLp: Number(document.querySelector("#lolPeakLp").value),
    valCurrent: document.querySelector("#valCurrent").value,
    valPeak: document.querySelector("#valPeak").value,
    gcLevel: Number(gcLevel.value)
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
  render();
  showToast("Comparação atualizada e salva neste navegador.");
  document.querySelector(".result-panel").scrollIntoView({ behavior: "smooth", block: "center" });
});

hydrate();
render();
