
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

function calcular() {
    const resultado = document.getElementById("resultado");
    if (!resultado) return;

    const fob = valorNumero("fob");
    const cbmCaixa = valorNumero("cbmCaixa");
    const pecasCaixa = valorNumero("pecasCaixa");
    const usdFrete = valorNumero("frete");

    const ii = valorNumero("ii") / 100;
    const ipi = valorNumero("ipi") / 100;
    const agente = valorNumero("agente") / 100;
    const margem = valorNumero("margem") / 100;

    const usdDespacho = valorNumero("usdDespacho", 6.10);
    const usd30 = valorNumero("usd30", usdDespacho);
    const usd70 = valorNumero("usd70", usdDespacho);

    const stCampo = document.getElementById("st");
    const stTexto = String(stCampo?.value ?? "").trim().replace(",", ".");
    const st = stTexto === "" ? null : (parseFloat(stTexto) / 100);

    const porto = document.getElementById("porto");
    const portoSel = porto?.options[porto.selectedIndex];
    const cbmContainer = parseFloat(portoSel?.dataset?.cbm || "0");

    if (!fob || !cbmCaixa || !pecasCaixa || !cbmContainer) {
        resultado.innerHTML = `
            <tr>
                <td colspan="2" class="text-danger text-center">
                    Preencha FOB, CBM caixa, peças por caixa e porto.
                </td>
            </tr>
        `;
        return;
    }

    // Constantes da planilha
    const pis = 0.0165;
    const cofins = 0.0760;
    const icmsImportacao = 0.18;
    const icmsVenda = 0.12;
    const cpmf = 0.0038;

    const armazenagemPct = 0.0041;
    const desembaraco = 1500;
    const adicionalCofinsPct = 0.015;
    const thcBL = 800;
    const desova = 600;
    const desconsolidacao = 120;
    const afrmmPct = 0.25;
    const emissaoDI = 214.5;
    const transporteInterno = 4500;
    const tagsEtiquetas = 37;

    const pagamento = "DP"; // igual à planilha
    const taxaFrete = usdDespacho * 1.10;

    // 1) Quantidade
    const quantidadeCaixas = cbmContainer / cbmCaixa;
    const pecasContainer = quantidadeCaixas * pecasCaixa;

    // 2) Em moeda estrangeira
    const produtoFOBUSD = pecasContainer * fob;
    const freteInternacionalUSD = usdFrete;
    const seguroInternacionalUSD = 0;
    const cifUSD = produtoFOBUSD + freteInternacionalUSD + seguroInternacionalUSD;

    // 3) Em moeda nacional
    const produtoFOBBRL = (produtoFOBUSD * 0.30 * usd30) + (produtoFOBUSD * 0.70 * usd70);
    const freteInternacionalBRL = freteInternacionalUSD * taxaFrete;
    const seguroInternacionalBRL = seguroInternacionalUSD * taxaFrete;
    const cifBRL = produtoFOBBRL + freteInternacionalBRL + seguroInternacionalBRL;

    // 4) Custos e tributos no destino
    const valorII = cifBRL * ii;
    const valorIPIImport = (cifBRL + valorII) * ipi;

    const basePisCofins =
        cifBRL * (1 + (icmsImportacao * (ii + ipi * (1 + ii)))) /
        ((1 - pis - cofins) * (1 - icmsImportacao));

    const valorPIS = pis * basePisCofins;
    const valorCOFINS = cofins * basePisCofins;

    const fechamentoCambio = pagamento === "CC" ? 0 : 250;
    const cartaCredito = pagamento === "DP" ? 0 : (300 * usdDespacho);

    const valorArmazenagem = armazenagemPct * cifBRL;
    const valorAdicionalCofins = adicionalCofinsPct * basePisCofins;
    const valorAFRMM = afrmmPct * freteInternacionalBRL;

    const subtotalDespacho =
        valorArmazenagem +
        desembaraco +
        valorAdicionalCofins +
        thcBL +
        desova +
        desconsolidacao +
        valorAFRMM +
        emissaoDI;

    const valorICMSImport =
        ((cifBRL + valorII + valorIPIImport + valorPIS + valorCOFINS + subtotalDespacho) / 0.7375) *
        icmsImportacao;

    const subtotalDestino =
        valorII +
        valorIPIImport +
        valorPIS +
        valorCOFINS +
        fechamentoCambio +
        cartaCredito +
        subtotalDespacho +
        valorICMSImport +
        transporteInterno +
        tagsEtiquetas;
    const custoTotal = cifBRL + subtotalDestino;
    let valorUsadoCalculo;
    let icmsVendaFormula;

    if (st === null) {
        valorUsadoCalculo = custoTotal - valorICMSImport - valorIPIImport - valorPIS - valorCOFINS;
        icmsVendaFormula = icmsVenda;
    } else {
        const baseCalculoST = custoTotal * (1 + st);
        const icmsRecolherST = baseCalculoST * 0.17;
        valorUsadoCalculo = custoTotal + icmsRecolherST - valorICMSImport - valorCOFINS - valorPIS - valorIPIImport;
        icmsVendaFormula = 0;
    }
    const coeficiente = (100 - ((icmsVendaFormula + cofins + pis + cpmf + margem) * 100)) / 100;
    const custoVendaCliente = valorUsadoCalculo / coeficiente;

    const valorICMSVenda = icmsVendaFormula ? (custoVendaCliente * icmsVendaFormula) : 0;
    const valorCofinsVenda = custoVendaCliente * cofins;
    const valorPisVenda = custoVendaCliente * pis;
    const valorIPIVenda = custoVendaCliente * ipi;
    const lucroBrutoGZT = custoVendaCliente * margem;
    const valorCPMFVenda = custoVendaCliente * cpmf;
    const comissaoAgente = ((cifBRL * agente) * 1.0925) + ((cifBRL * agente) * 0.25);
    const valorDesconto = custoVendaCliente * 0.30;

    const subtotalVenda =
        valorICMSVenda +
        valorCofinsVenda +
        valorPisVenda +
        valorIPIVenda +
        lucroBrutoGZT +
        valorCPMFVenda +
        comissaoAgente +
        valorDesconto;
    const custoTotalVendaSemIPI = subtotalVenda - valorIPIVenda + valorUsadoCalculo;
    const custoTotalVendaComIPI = valorUsadoCalculo + subtotalVenda;

    const precoVenda = custoTotalVendaSemIPI / pecasContainer;
    const precoVendaIPI = custoTotalVendaComIPI / pecasContainer;
    const custoUnitario = valorUsadoCalculo / pecasContainer;
    const fobCTNR = pecasContainer * fob;

    let margemGzt15;
    let margemGzt29;

    const precoGrazziotin25 = precoVenda * 0.75;

    if (st === null) {
        margemGzt15 =
            ((((precoVenda * 0.85) - ((precoVenda * 0.85) * (0.0925 + icmsVenda))) - custoUnitario) /
            (((precoVenda * 0.85) - ((precoVenda * 0.85) * (0.0925 + icmsVenda))))) * 100;

        margemGzt29 =
            (((((precoGrazziotin25 * 0.96) - ((precoGrazziotin25 * 0.96) * (0.0925 + icmsVenda))) - custoUnitario) /
            (((precoGrazziotin25 * 0.96) - ((precoGrazziotin25 * 0.96) * (0.0925 + icmsVenda))))) * 100);
    } else {
        margemGzt15 =
            ((((precoVenda * 0.85) - ((precoVenda * 0.85) * 0.0925)) - custoUnitario) /
            (((precoVenda * 0.85) - ((precoVenda * 0.85) * 0.0925)))) * 100;

        margemGzt29 =
            (((((precoGrazziotin25 * 0.96) - ((precoGrazziotin25 * 0.96) * 0.0925)) - custoUnitario) /
            (((precoGrazziotin25 * 0.96) - ((precoGrazziotin25 * 0.96) * 0.0925)))) * 100);
    }

    const multipleGzt = precoVenda / fob;
    const multipleGrz = precoGrazziotin25 / fob;

    resultado.innerHTML = `
        <tr><td>Peças por container</td><td>${formatarNumeroBR(pecasContainer, 0)}</td></tr>
        <tr><td>Preço venda</td><td>${formatarNumeroBR(precoVenda, 2)}</td></tr>
        <tr><td>Preço venda c/ IPI</td><td>${formatarNumeroBR(precoVendaIPI, 2)}</td></tr>
        <tr><td>FOB CTNR</td><td>${formatarNumeroBR(fobCTNR, 2)}</td></tr>
        <tr><td>Custo unitário</td><td>${formatarNumeroBR(custoUnitario, 2)}</td></tr>
        <tr><td>Margem GZT -15%</td><td>${formatarNumeroBR(margemGzt15, 2)}</td></tr>
        <tr><td>multiple gzt</td><td>${formatarNumeroBR(multipleGzt, 1)}</td></tr>
        <tr><td>R$ grazziotin -25%</td><td>${formatarNumeroBR(precoGrazziotin25, 2)}</td></tr>
        <tr><td>margem GZT -29%</td><td>${formatarNumeroBR(margemGzt29, 2)}</td></tr>
        <tr><td>multiple grz</td><td>${formatarNumeroBR(multipleGrz, 1)}</td></tr>
    `;
}
