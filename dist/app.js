const STORAGE_KEY = "abaixo-do-subzero:v1";

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
  "Ferro 1", "Ferro 2", "Ferro 3",
  "Bronze 1", "Bronze 2", "Bronze 3",
  "Prata 1", "Prata 2", "Prata 3",
  "Ouro 1", "Ouro 2", "Ouro 3",
  "Platina 1", "Platina 2", "Platina 3",
  "Diamante 1", "Diamante 2", "Diamante 3",
  "Ascendente 1", "Ascendente 2", "Ascendente 3",
  "Imortal 1", "Imortal 2", "Imortal 3", "Radiante"
];

const defaults = {
  player: {
    nickname: "Frostzera",
    riotId: "Jogador#BR1",
    lolCurrent: "Ouro II",
    lolPeak: "Platina III",
    valCurrent: "Prata 3",
    valPeak: "Ouro 2",
    gcLevel: 10
  },
  owner: {
    lolCurrent: "Platina IV",
    valCurrent: "Ouro 3",
    gcCurrent: 12,
    lolPeak: "Diamante II",
    valPeak: "Ascendente 1",
    gcPeak: 16
  }
};

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return {
      player: { ...defaults.player, ...(parsed?.player || {}) },
      owner: { ...defaults.owner, ...(parsed?.owner || {}) }
    };
  } catch {
    return structuredClone(defaults);
  }
}

let state = loadState();

function fillSelect(select, options, selected) {
  select.replaceChildren(...options.map((label) => {
    const option = document.createElement("option");
    option.value = label;
    option.textContent = label;
    option.selected = label === selected;
    return option;
  }));
}

function rankScore(rank, list) {
  const index = Math.max(0, list.indexOf(rank));
  return Math.round((index / (list.length - 1)) * 100);
}

function combinedScore(lol, val, gc) {
  return Math.round((rankScore(lol, lolRanks) + rankScore(val, valRanks) + ((Number(gc) - 1) / 19) * 100) / 3);
}

function comparisonPercent(playerScore, ownerScore) {
  return Math.max(0, Math.min(120, Math.round((playerScore / Math.max(ownerScore, 1)) * 100)));
}

function comparisonCopy(percent, mode) {
  if (percent >= 110) return mode === "peak"
    ? "Plot twist: o desafiante passou até da sua versão lendária."
    : "Alerta vermelho: hoje o congelado seria você.";
  if (percent >= 95) return "Empate técnico. Qualquer partida pode virar a sentença.";
  if (percent >= 75) return "Já dá para sentir o frio na nuca. A distância ficou curta.";
  if (percent >= 50) return "Está no caminho, mas ainda faltam alguns graus para encostar.";
  return "O termômetro nem se mexeu. Por enquanto, segue no freezer.";
}

function verdictFor(score, currentPercent) {
  if (currentPercent >= 110) return "O aprendiz virou o freezer contra o criador. <strong>Você foi descongelado.</strong>";
  if (currentPercent >= 95) return "Risco de empate técnico. <strong>Marque a MD3 imediatamente.</strong>";
  if (score >= 65) return "Promissor, perigoso e quase climatizado. <strong>A zoeira está por um fio.</strong>";
  if (score >= 40) return "Promissor, mas ainda oficialmente <strong>abaixo do subzero.</strong>";
  return "Quadro grave de hipotermia competitiva. <strong>Permaneça no aquecimento.</strong>";
}

function render() {
  const { player, owner } = state;
  const playerScore = combinedScore(player.lolCurrent, player.valCurrent, player.gcLevel);
  const ownerCurrent = combinedScore(owner.lolCurrent, owner.valCurrent, owner.gcCurrent);
  const ownerPeak = combinedScore(owner.lolPeak, owner.valPeak, owner.gcPeak);
  const peakPercent = comparisonPercent(playerScore, ownerPeak);
  const currentPercent = comparisonPercent(playerScore, ownerCurrent);

  document.querySelector("#resultName").textContent = player.nickname || "Sem nome";
  document.querySelector("#resultRiot").textContent = player.riotId || "Riot ID não informado";
  document.querySelector("#avatar").textContent = (player.nickname || "?").trim().charAt(0).toUpperCase();
  document.querySelector("#freezeIndex").textContent = playerScore;
  document.querySelector("#resultLol").textContent = player.lolCurrent;
  document.querySelector("#resultVal").textContent = player.valCurrent;
  document.querySelector("#resultGc").textContent = player.gcLevel;
  document.querySelector("#peakPercent").textContent = `${peakPercent}%`;
  document.querySelector("#currentPercent").textContent = `${currentPercent}%`;
  document.querySelector("#peakBar").style.width = `${Math.min(peakPercent, 100)}%`;
  document.querySelector("#currentBar").style.width = `${Math.min(currentPercent, 100)}%`;
  document.querySelector("#peakCopy").textContent = comparisonCopy(peakPercent, "peak");
  document.querySelector("#currentCopy").textContent = comparisonCopy(currentPercent, "current");
  document.querySelector("#verdict p").innerHTML = verdictFor(playerScore, currentPercent);
}

function hydrateForms() {
  const { player, owner } = state;
  fillSelect(document.querySelector("#lolCurrent"), lolRanks, player.lolCurrent);
  fillSelect(document.querySelector("#lolPeak"), lolRanks, player.lolPeak);
  fillSelect(document.querySelector("#valCurrent"), valRanks, player.valCurrent);
  fillSelect(document.querySelector("#valPeak"), valRanks, player.valPeak);
  fillSelect(document.querySelector("#ownerLolCurrent"), lolRanks, owner.lolCurrent);
  fillSelect(document.querySelector("#ownerLolPeak"), lolRanks, owner.lolPeak);
  fillSelect(document.querySelector("#ownerValCurrent"), valRanks, owner.valCurrent);
  fillSelect(document.querySelector("#ownerValPeak"), valRanks, owner.valPeak);

  document.querySelector("#nickname").value = player.nickname;
  document.querySelector("#riotId").value = player.riotId;
  document.querySelector("#gcLevel").value = player.gcLevel;
  document.querySelector("#gcOutput").value = player.gcLevel;
  document.querySelector("#ownerGcCurrent").value = owner.gcCurrent;
  document.querySelector("#ownerGcPeak").value = owner.gcPeak;
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let toastTimer;
function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

const gcLevel = document.querySelector("#gcLevel");
gcLevel.addEventListener("input", () => {
  document.querySelector("#gcOutput").value = gcLevel.value;
});

document.querySelector("#playerForm").addEventListener("submit", (event) => {
  event.preventDefault();
  state.player = {
    nickname: document.querySelector("#nickname").value.trim(),
    riotId: document.querySelector("#riotId").value.trim(),
    lolCurrent: document.querySelector("#lolCurrent").value,
    lolPeak: document.querySelector("#lolPeak").value,
    valCurrent: document.querySelector("#valCurrent").value,
    valPeak: document.querySelector("#valPeak").value,
    gcLevel: Number(gcLevel.value)
  };
  save();
  render();
  showToast("Laudo atualizado e salvo neste navegador.");
  document.querySelector(".result-panel").scrollIntoView({ behavior: "smooth", block: "center" });
});

const dialog = document.querySelector("#settingsDialog");
document.querySelector("#openSettings").addEventListener("click", () => dialog.showModal());
document.querySelector("#cancelSettings").addEventListener("click", () => dialog.close());

document.querySelector("#settingsForm").addEventListener("submit", (event) => {
  event.preventDefault();
  state.owner = {
    lolCurrent: document.querySelector("#ownerLolCurrent").value,
    valCurrent: document.querySelector("#ownerValCurrent").value,
    gcCurrent: Number(document.querySelector("#ownerGcCurrent").value),
    lolPeak: document.querySelector("#ownerLolPeak").value,
    valPeak: document.querySelector("#ownerValPeak").value,
    gcPeak: Number(document.querySelector("#ownerGcPeak").value)
  };
  save();
  render();
  dialog.close();
  showToast("Sua régua foi atualizada.");
});

hydrateForms();
render();
