let PARAMS = {};

const PARAMS_PADRAO = {
    pis: 0.0165,
    cofins: 0.076,
    icmsImportacao: 0.18,
    icmsVenda: 0.12,
    cpmf: 0.0038,

    armazenagemPct: 0.0041,
    desembaraco: 1500,
    adicionalCofinsPct: 0.015,
    thcBL: 800,
    desova: 600,
    desconsolidacao: 120,
    afrmmPct: 0.25,
    emissaoDI: 214.5,
    transporteInterno: 4500,
    tagsEtiquetas: 37,

    defaults: {
        ii: 25,
        ipi: 7,
        agente: 5,
        margem: 27,
        usdDespacho: 6.10,
        usd30: 6.10,
        usd70: 6.10
    }
};

function valorNumero(id, padrao = 0) {
    const el = document.getElementById(id);
    if (!el) return padrao;
    const txt = String(el.value ?? "").trim().replace(",", ".");
    const num = parseFloat(txt);
    return Number.isFinite(num) ? num : padrao;
}

function formatarNumeroBR(valor, casas = 2) {
    if (valor === null || valor === undefined || isNaN(valor)) return "";
    return Number(valor).toLocaleString("pt-BR", {
        minimumFractionDigits: casas,
        maximumFractionDigits: casas
    });
}

function lerPercentual(id) {
    const el = document.getElementById(id);
    let valor = String(el?.value ?? "").trim();
    if (valor === "") return null;
    valor = valor.replace("%", "").replace(",", ".");
    const numero = parseFloat(valor);
    return Number.isFinite(numero) ? numero / 100 : null;
}

function carregarParametros() {
    const local = localStorage.getItem("parametros");
    if (local) {
        PARAMS = JSON.parse(local);
        if (!PARAMS.defaults) PARAMS.defaults = PARAMS_PADRAO.defaults;
        return;
    }
    PARAMS = JSON.parse(JSON.stringify(PARAMS_PADRAO));
}

function aplicarParametrosNaTela() {
    document.getElementById("ii").value = PARAMS.defaults.ii;
    document.getElementById("ipi").value = PARAMS.defaults.ipi;
    document.getElementById("agente").value = PARAMS.defaults.agente;
    document.getElementById("margem").value = PARAMS.defaults.margem;
    document.getElementById("usdDespacho").value = PARAMS.defaults.usdDespacho;
    document.getElementById("usd30").value = PARAMS.defaults.usd30;
    document.getElementById("usd70").value = PARAMS.defaults.usd70;
}

function abrirParametros() {
    document.getElementById("p_pis").value = PARAMS.pis;
    document.getElementById("p_cofins").value = PARAMS.cofins;
    document.getElementById("p_icmsImportacao").value = PARAMS.icmsImportacao;
    document.getElementById("p_icmsVenda").value = PARAMS.icmsVenda;
    document.getElementById("p_cpmf").value = PARAMS.cpmf;

    document.getElementById("p_armazenagemPct").value = PARAMS.armazenagemPct;
    document.getElementById("p_desembaraco").value = PARAMS.desembaraco;
    document.getElementById("p_afrmmPct").value = PARAMS.afrmmPct;
    document.getElementById("p_transporteInterno").value = PARAMS.transporteInterno;

    document.getElementById("p_thcBL").value = PARAMS.thcBL;
    document.getElementById("p_desova").value = PARAMS.desova;
    document.getElementById("p_desconsolidacao").value = PARAMS.desconsolidacao;
    document.getElementById("p_emissaoDI").value = PARAMS.emissaoDI;
    document.getElementById("p_tagsEtiquetas").value = PARAMS.tagsEtiquetas;

    document.getElementById("p_ii").value = PARAMS.defaults.ii;
    document.getElementById("p_ipi").value = PARAMS.defaults.ipi;
    document.getElementById("p_agente").value = PARAMS.defaults.agente;
    document.getElementById("p_margem").value = PARAMS.defaults.margem;
    document.getElementById("p_usdDespacho").value = PARAMS.defaults.usdDespacho;
    document.getElementById("p_usd30").value = PARAMS.defaults.usd30;
    document.getElementById("p_usd70").value = PARAMS.defaults.usd70;

    new bootstrap.Modal(document.getElementById("modalParametros")).show();
}

function salvarParametros() {
    PARAMS.pis = parseFloat(document.getElementById("p_pis").value) || 0;
    PARAMS.cofins = parseFloat(document.getElementById("p_cofins").value) || 0;
    PARAMS.icmsImportacao = parseFloat(document.getElementById("p_icmsImportacao").value) || 0;
    PARAMS.icmsVenda = parseFloat(document.getElementById("p_icmsVenda").value) || 0;
    PARAMS.cpmf = parseFloat(document.getElementById("p_cpmf").value) || 0;

    PARAMS.armazenagemPct = parseFloat(document.getElementById("p_armazenagemPct").value) || 0;
    PARAMS.desembaraco = parseFloat(document.getElementById("p_desembaraco").value) || 0;
    PARAMS.afrmmPct = parseFloat(document.getElementById("p_afrmmPct").value) || 0;
    PARAMS.transporteInterno = parseFloat(document.getElementById("p_transporteInterno").value) || 0;

    PARAMS.thcBL = parseFloat(document.getElementById("p_thcBL").value) || 0;
    PARAMS.desova = parseFloat(document.getElementById("p_desova").value) || 0;
    PARAMS.desconsolidacao = parseFloat(document.getElementById("p_desconsolidacao").value) || 0;
    PARAMS.emissaoDI = parseFloat(document.getElementById("p_emissaoDI").value) || 0;
    PARAMS.tagsEtiquetas = parseFloat(document.getElementById("p_tagsEtiquetas").value) || 0;

    PARAMS.defaults = {
        ii: parseFloat(document.getElementById("p_ii").value) || 0,
        ipi: parseFloat(document.getElementById("p_ipi").value) || 0,
        agente: parseFloat(document.getElementById("p_agente").value) || 0,
        margem: parseFloat(document.getElementById("p_margem").value) || 0,
        usdDespacho: parseFloat(document.getElementById("p_usdDespacho").value) || 0,
        usd30: parseFloat(document.getElementById("p_usd30").value) || 0,
        usd70: parseFloat(document.getElementById("p_usd70").value) || 0
    };

    localStorage.setItem("parametros", JSON.stringify(PARAMS));
    aplicarParametrosNaTela();
}

function calcular() {
    const resultado = document.getElementById("resultado");

    const fob = valorNumero("fob");
    const cbmCaixa = valorNumero("cbmCaixa");
    const pecasCaixa = valorNumero("pecasCaixa");
    const usdFrete = valorNumero("frete");

    const ii = valorNumero("ii") / 100;
    const ipi = valorNumero("ipi") / 100;
    const agente = valorNumero("agente") / 100;
    const margem = valorNumero("margem") / 100;

    const usdDespacho = valorNumero("usdDespacho");
    const usd30 = valorNumero("usd30");
    const usd70 = valorNumero("usd70");

    const st = lerPercentual("st");

    const porto = document.getElementById("porto");
    const cbmContainer = parseFloat(porto.options[porto.selectedIndex].dataset.cbm);

    const pis = PARAMS.pis;
    const cofins = PARAMS.cofins;
    const icmsImportacao = PARAMS.icmsImportacao;
    const icmsVenda = PARAMS.icmsVenda;
    const cpmf = PARAMS.cpmf;

    const armazenagemPct = PARAMS.armazenagemPct;
    const desembaraco = PARAMS.desembaraco;
    const adicionalCofinsPct = PARAMS.adicionalCofinsPct;
    const thcBL = PARAMS.thcBL;
    const desova = PARAMS.desova;
    const desconsolidacao = PARAMS.desconsolidacao;
    const afrmmPct = PARAMS.afrmmPct;
    const emissaoDI = PARAMS.emissaoDI;
    const transporteInterno = PARAMS.transporteInterno;
    const tagsEtiquetas = PARAMS.tagsEtiquetas;

    const quantidadeCaixas = cbmContainer / cbmCaixa;
    const pecasContainer = quantidadeCaixas * pecasCaixa;

    const produtoFOBUSD = pecasContainer * fob;
    const cifUSD = produtoFOBUSD + usdFrete;

    const produtoFOBBRL = (produtoFOBUSD * 0.30 * usd30) + (produtoFOBUSD * 0.70 * usd70);
    const freteBRL = usdFrete * usdDespacho * 1.10;
    const cifBRL = produtoFOBBRL + freteBRL;

    const valorII = cifBRL * ii;
    const valorIPIImport = (cifBRL + valorII) * ipi;

    const basePisCofins =
        cifBRL * (1 + (icmsImportacao * (ii + ipi * (1 + ii)))) /
        ((1 - pis - cofins) * (1 - icmsImportacao));

    const valorPIS = pis * basePisCofins;
    const valorCOFINS = cofins * basePisCofins;

    const valorArmazenagem = armazenagemPct * cifBRL;
    const valorAFRMM = afrmmPct * freteBRL;

    const subtotalDespacho =
        valorArmazenagem +
        desembaraco +
        thcBL +
        desova +
        desconsolidacao +
        valorAFRMM +
        emissaoDI;

    const valorICMSImport =
        ((cifBRL + valorII + valorIPIImport + valorPIS + valorCOFINS + subtotalDespacho) / 0.7375) *
        icmsImportacao;

    const custoTotal =
        cifBRL +
        valorII +
        valorIPIImport +
        valorPIS +
        valorCOFINS +
        subtotalDespacho +
        valorICMSImport +
        transporteInterno +
        tagsEtiquetas;

    const valorUsadoCalculo = custoTotal - valorICMSImport - valorIPIImport - valorPIS - valorCOFINS;

    const coeficiente = (100 - ((icmsVenda + cofins + pis + cpmf + margem) * 100)) / 100;
    const custoVendaCliente = valorUsadoCalculo / coeficiente;

    const precoVenda = custoVendaCliente / pecasContainer;
    const custoUnitario = valorUsadoCalculo / pecasContainer;

    const precoVendaIPI = precoVenda * (1 + ipi);
    const fobCTNR = pecasContainer * fob;

    const precoGrazziotin25 = precoVenda * 0.75;

    const margemGzt15 = 15;
    const margemGzt29 = 29;

    const multipleGzt = precoVenda / fob;
    const multipleGrz = precoGrazziotin25 / fob;

    resultado.innerHTML = `
        <tr><td>Peças por container</td><td>${formatarNumeroBR(pecasContainer, 0)}</td></tr>
        <tr><b><td>Custo unitário</td><td>R$ ${formatarNumeroBR(custoUnitario, 2)}</td></b></tr>
        <tr><td>Preço venda</td><td>R$ ${formatarNumeroBR(precoVenda, 2)}</td></tr>
        <tr><td>Preço venda c/ IPI</td><td>${formatarNumeroBR(precoVendaIPI, 2)}</td></tr>
        <tr><td>Custo CTNR</td><td>USD ${formatarNumeroBR(fobCTNR, 2)}</td></tr>
        <tr><td>Margem -15%</td><td>${formatarNumeroBR(margemGzt15, 2)} %</td></tr>
        <tr><td>Multiple GZT</td><td>${formatarNumeroBR(multipleGzt, 1)}</td></tr>
        <tr><td>Custo Grazziotin -25%</td><td>R$ ${formatarNumeroBR(precoGrazziotin25, 2)}</td></tr>
        <tr><td>Margem -29%</td><td>${formatarNumeroBR(margemGzt29, 2)} %</td></tr>
        <tr><td>Multiple GRZ</td><td>${formatarNumeroBR(multipleGrz, 1)}</td></tr>
    `;
}

function init() {
    carregarParametros();
    aplicarParametrosNaTela();
}

document.addEventListener("DOMContentLoaded", init);