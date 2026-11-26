const STORAGE_KEY = "abaixo-do-subzero:v5";

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
  "Sem elo", "Ferro 1", "Ferro 2", "Ferro 3", "Bronze 1", "Bronze 2", "Bronze 3",
  "Prata 1", "Prata 2", "Prata 3", "Ouro 1", "Ouro 2", "Ouro 3",
  "Platina 1", "Platina 2", "Platina 3", "Diamante 1", "Diamante 2", "Diamante 3",
  "Ascendente 1", "Ascendente 2", "Ascendente 3", "Imortal 1", "Imortal 2", "Imortal 3", "Radiante"
];

const reference = {
  current: { lolRank: "Diamante I", lolLp: 75, valRank: "Diamante 3", gcLevel: 20 },
  peak: { lolRank: "Mestre", lolLp: 217, valRank: "Imortal 1", gcLevel: 20 }
};

const defaults = {
  riotId: "",
  valCurrent: "Prata 3",
  gcLevel: 10,
  lol: null
};

function loadPlayer() {
  try {
    return { ...defaults, ...(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}) };
  } catch {
    return { ...defaults };
  }
}

let player = loadPlayer();
let lookupTimer;
let lastLookupId = player.lol?.riotId || "";

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
  if (!rank || rank === "Sem elo") return 0;
  const numericLp = Math.max(0, Number(lp) || 0);
  if (rank === "Mestre") return 2800 + numericLp;
  if (rank === "Grão-Mestre") return 4000 + numericLp;
  if (rank === "Desafiante") return 6000 + numericLp;
  const index = Math.max(0, lolRanks.indexOf(rank));
  return index * 100 + Math.min(numericLp, 99);
}

function valRankScore(rank) {
  return Math.max(0, valRanks.indexOf(rank));
}

function percentOf(score, target) {
  return Math.max(0, Math.round((score / Math.max(target, 1)) * 100));
}

function comparisonCopy(currentPercent, peakPercent, label) {
  const currentText = currentPercent >= 100 ? "alcançou o Subzero atual" : `está em ${currentPercent}% do Subzero atual`;
  const peakText = peakPercent >= 100 ? "alcançou o auge" : `está em ${peakPercent}% do auge`;
  return `No ${label}, você ${currentText} e ${peakText}.`;
}

function overallCopy(percent) {
  if (percent >= 110) return `Na média, você está ${percent - 100}% acima do fr0sty atual.`;
  if (percent >= 100) return "Na média dos três jogos, você alcançou ou superou o fr0sty atual.";
  if (percent >= 90) return "A média geral está muito próxima. A disputa é equilibrada.";
  if (percent >= 70) return "Você já percorreu boa parte da distância até a referência geral.";
  return `Sua média atual representa ${percent}% do balanço do fr0sty.`;
}

function formatLol(lol) {
  if (!lol) return "Não consultado";
  if (!lol.ranked) return "Sem elo Solo/Duo";
  return `${lol.rankLabel} · ${lol.leaguePoints} LP`;
}

function setLookupStatus(state, message) {
  const status = document.querySelector("#lolLookupStatus");
  status.dataset.state = state;
  status.querySelector("span").textContent = message;
}

function setBar(id, percent) {
  document.querySelector(id).style.width = `${Math.min(Math.max(percent, 0), 100)}%`;
}

function setMarker(id, percent) {
  document.querySelector(id).style.left = `${Math.min(Math.max(percent, 0), 100)}%`;
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
}

function render() {
  const valScore = valRankScore(player.valCurrent);
  const valPercent = percentOf(valScore, valRankScore(reference.current.valRank));
  const valPeakPercent = percentOf(valScore, valRankScore(reference.peak.valRank));
  const gcPercent = percentOf(player.gcLevel, reference.current.gcLevel);
  const gcPeakPercent = percentOf(player.gcLevel, reference.peak.gcLevel);
  const lolScore = player.lol ? rankScore(player.lol.rankLabel, player.lol.leaguePoints) : null;
  const lolPercent = player.lol
    ? percentOf(lolScore, rankScore(reference.current.lolRank, reference.current.lolLp))
    : null;
  const lolPeakPercent = player.lol
    ? percentOf(lolScore, rankScore(reference.peak.lolRank, reference.peak.lolLp))
    : null;

  const fallbackName = player.riotId.includes("#") ? player.riotId.split("#")[0] : "Aguardando Riot ID";
  const displayName = player.lol?.gameName || fallbackName;
  document.querySelector("#resultName").textContent = displayName;
  document.querySelector("#resultRiot").textContent = player.lol?.riotId || player.riotId || "Nick#TAG";
  document.querySelector("#avatar").textContent = displayName.charAt(0).toUpperCase() || "?";
  document.querySelector("#resultLol").textContent = formatLol(player.lol);
  document.querySelector("#resultVal").textContent = player.valCurrent;
  document.querySelector("#resultGc").textContent = `Nível ${player.gcLevel}`;

  document.querySelector("#valPercent").textContent = `${valPercent}%`;
  document.querySelector("#valPeakPercent").textContent = `${valPeakPercent}% do auge`;
  document.querySelector("#gcPercent").textContent = `${gcPercent}%`;
  document.querySelector("#gcPeakPercent").textContent = `${gcPeakPercent}% do auge`;
  document.querySelector("#playerValCaption").textContent = player.valCurrent;
  document.querySelector("#playerGcCaption").textContent = `Nível ${player.gcLevel}`;
  document.querySelector("#valCopy").textContent = comparisonCopy(valPercent, valPeakPercent, "VALORANT");
  document.querySelector("#gcCopy").textContent = comparisonCopy(gcPercent, gcPeakPercent, "GC");
  setBar("#valBar", valPeakPercent);
  setBar("#gcBar", gcPeakPercent);
  setMarker("#valCurrentMarker", percentOf(valRankScore(reference.current.valRank), valRankScore(reference.peak.valRank)));
  setMarker("#lolCurrentMarker", percentOf(rankScore(reference.current.lolRank, reference.current.lolLp), rankScore(reference.peak.lolRank, reference.peak.lolLp)));

  const status = document.querySelector("#overallStatus");
  if (lolPercent === null) {
    document.querySelector("#lolPercent").textContent = "—";
    document.querySelector("#lolPeakPercent").textContent = "— do auge";
    document.querySelector("#playerLolCaption").textContent = "Aguardando consulta";
    document.querySelector("#lolCopy").textContent = "Informe o Riot ID para completar esta comparação.";
    setBar("#lolBar", 0);
    document.querySelector("#overallPercent").textContent = "—";
    document.querySelector("#overallCopy").textContent = "A média aparece assim que o elo do LoL for consultado.";
    setBar("#overallBar", 0);
    status.textContent = "Pendente";
    status.classList.remove("above");
    return;
  }

  const lolLabel = formatLol(player.lol);
  const average = Math.round((lolPercent + valPercent + gcPercent) / 3);
  document.querySelector("#lolPercent").textContent = `${lolPercent}%`;
  document.querySelector("#lolPeakPercent").textContent = `${lolPeakPercent}% do auge`;
  document.querySelector("#playerLolCaption").textContent = lolLabel;
  document.querySelector("#lolCopy").textContent = comparisonCopy(lolPercent, lolPeakPercent, "LoL");
  setBar("#lolBar", lolPeakPercent);
  document.querySelector("#overallPercent").textContent = `${average}%`;
  document.querySelector("#overallCopy").textContent = overallCopy(average);
  setBar("#overallBar", average);
  status.textContent = average >= 100 ? "Na referência ou acima" : `${average}% da referência`;
  status.classList.toggle("above", average >= 100);
}

async function lookupLol(force = false) {
  const riotId = document.querySelector("#riotId").value.trim();
  player.riotId = riotId;

  if (!riotId.includes("#") || riotId.startsWith("#") || riotId.endsWith("#")) {
    player.lol = null;
    setLookupStatus("error", "Use o formato completo Nick#TAG.");
    render();
    return false;
  }

  if (!force && riotId.toLowerCase() === lastLookupId.toLowerCase() && player.lol) {
    return true;
  }

  const button = document.querySelector("#analyzeButton");
  button.disabled = true;
  button.textContent = "Consultando Riot…";
  setLookupStatus("loading", "Buscando o elo Solo/Duo na Riot…");

  try {
    const response = await fetch(`/api/lol-rank?riotId=${encodeURIComponent(riotId)}`, {
      headers: { Accept: "application/json" }
    });
    const data = await response.json();
    if (!response.ok) throw Object.assign(new Error(data.message || "Não foi possível consultar a conta."), { code: data.code });

    player.lol = data;
    player.riotId = data.riotId;
    lastLookupId = data.riotId;
    document.querySelector("#riotId").value = data.riotId;
    setLookupStatus("success", data.ranked ? `Encontrado: ${data.rankLabel}, ${data.leaguePoints} LP.` : "Conta encontrada, sem elo Solo/Duo nesta temporada.");
    save();
    render();
    return true;
  } catch (error) {
    player.lol = null;
    const message = error.code === "RIOT_KEY_MISSING"
      ? "LoL indisponível: a chave oficial da Riot ainda não foi configurada no servidor."
      : error.message;
    setLookupStatus("error", message);
    render();
    return false;
  } finally {
    button.disabled = false;
    button.textContent = "Analisar agora";
  }
}

function hydrate() {
  fillSelect(document.querySelector("#valCurrent"), valRanks, player.valCurrent);
  document.querySelector("#riotId").value = player.riotId;
  document.querySelector("#gcLevel").value = player.gcLevel;
  document.querySelector("#gcOutput").value = player.gcLevel;
  if (player.lol) setLookupStatus("success", `Última consulta: ${formatLol(player.lol)}.`);
}

let toastTimer;
function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
}

document.querySelector("#gcLevel").addEventListener("input", (event) => {
  player.gcLevel = Number(event.target.value);
  document.querySelector("#gcOutput").value = player.gcLevel;
  save();
  render();
});

document.querySelector("#valCurrent").addEventListener("change", (event) => {
  player.valCurrent = event.target.value;
  save();
  render();
});

document.querySelector("#riotId").addEventListener("input", (event) => {
  clearTimeout(lookupTimer);
  const riotId = event.target.value.trim();
  player.riotId = riotId;
  if (player.lol && riotId.toLowerCase() !== player.lol.riotId.toLowerCase()) player.lol = null;
  save();
  render();
  if (riotId.includes("#") && riotId.split("#")[1]?.length >= 2) {
    lookupTimer = setTimeout(() => lookupLol(), 900);
  } else {
    setLookupStatus("idle", "Digite o Riot ID completo para consultar o elo.");
  }
});

document.querySelector("#playerForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  player.valCurrent = document.querySelector("#valCurrent").value;
  player.gcLevel = Number(document.querySelector("#gcLevel").value);
  save();
  render();
  const success = await lookupLol(true);
  if (success) {
    showToast("Perfil consultado e comparação atualizada.");
    document.querySelector(".result-panel").scrollIntoView({ behavior: "smooth", block: "center" });
  }
});

hydrate();
render();
