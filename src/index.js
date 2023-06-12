import "./styles.css";

import { Chart } from "frappe-charts/dist/frappe-charts.min.esm";

const jsonQuery = {
  query: [
    {
      code: "Vuosi",
      selection: {
        filter: "item",
        values: [
          "2000",
          "2001",
          "2002",
          "2003",
          "2004",
          "2005",
          "2006",
          "2007",
          "2008",
          "2009",
          "2010",
          "2011",
          "2012",
          "2013",
          "2014",
          "2015",
          "2016",
          "2017",
          "2018",
          "2019",
          "2020",
          "2021"
        ]
      }
    },
    {
      code: "Alue",
      selection: {
        filter: "item",
        values: ["SSS"]
      }
    },
    {
      code: "Tiedot",
      selection: {
        filter: "item",
        values: ["vaesto"]
      }
    }
  ],
  response: {
    format: "json-stat2"
  }
};

const input = document.getElementById("input-area");
const btnSearch = document.getElementById("submit-data");
const btnAdd = document.getElementById("add-data");
const btnNavigation = document.getElementById("navigation");

btnNavigation.addEventListener("click", () => {
  const municipalityCode = jsonQuery.query[1].selection.values[0];
  window.location.replace(
    `/newchart.html?municipalityName=${Object.keys(municipalities).find(
      (municipality) => municipalities[municipality] === municipalityCode
    )}&municipalityCode=${municipalityCode}`
  );
});

const municipalities = {};
let chart;

btnSearch.addEventListener("click", async (e) => {
  e.preventDefault();

  if (municipalities.hasOwnProperty(input.value.toLowerCase().trim())) {
    jsonQuery.query[1].selection.values = [
      municipalities[input.value.toLowerCase().trim()]
    ];
    buildChart();
  }
  input.value = "";
});

btnAdd.addEventListener("click", () => {
  const calculateMean = (list) => {
    let sum = 0;
    for (let i = 0; i < list.length - 1; i++) {
      sum += list[i + 1] - list[i];
    }
    sum /= list.length - 1;
    sum += list[list.length - 1];
    return sum;
  };

  // lets make sure speculative data for year 2022 wasnt added already
  if (chart.data.labels.includes("2022")) {
    return;
  }
  const label = "2022";
  /* console.log(chart.data.datasets[0].values); */
  const value = calculateMean(chart.data.datasets[0].values);
  /* console.log(`mean ${value}`); */
  chart.addDataPoint(label, [value]);
});

const fetchData = async () => {
  /* console.log(jsonQuery); */
  const url =
    "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px";

  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(jsonQuery)
  });
  if (!response.ok) {
    return;
  }
  const data = await response.json();

  // we download needed codes for all municipalities in finland
  if (Object.keys(municipalities).length === 0) {
    const response = await fetch(
      "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px"
    );
    if (!response.ok) {
      return;
    }
    const data = await response.json();
    for (let i = 0; i < data.variables[1].valueTexts.length; i++) {
      municipalities[data.variables[1].valueTexts[i].toLowerCase()] =
        data.variables[1].values[i];
    }
  }

  return data;
};

const buildChart = async () => {
  const dataset = await fetchData();

  const chartData = {
    labels: Object.values(dataset.dimension.Vuosi.category.label),
    datasets: [
      {
        name: "Births",
        values: Object.values(dataset.value)
      }
    ]
  };

  chart = new Chart("#chart", {
    title: `Population growth in ${Object.keys(municipalities).find((key) => {
      return municipalities[key] === jsonQuery.query[1].selection.values[0];
    })}`,
    data: chartData,
    type: "line",
    height: 450,
    colors: ["#eb5146"]
  });
};

buildChart();
