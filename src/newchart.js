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
        values: ["vm01", "vm11"]
      }
    }
  ],
  response: {
    format: "json-stat2"
  }
};

const btnNavigation = document.getElementById("navigation");

btnNavigation.addEventListener("click", () => {
  window.location.replace("/index.html");
});

const fetchData = async () => {
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

  return data;
};

const buildChart = async () => {
  // by default we fetchwithcode SSS, that is for whole country
  // get correct municipality
  const urlParams = new URLSearchParams(window.location.search);
  const name = urlParams.get("municipalityName");
  const code = urlParams.get("municipalityCode");
  //update code to correct municipality first
  jsonQuery.query[1].selection.values = [code];

  // now fetch data
  const dataset = await fetchData();
  const categories = Object.values(dataset.dimension.Tiedot.category.label);
  const values = dataset.value;
  /* console.log(dataset); */

  const data = {
    labels: Object.values(dataset.dimension.Vuosi.category.label),
    datasets: []
  };
  categories.forEach((category, index) => {
    let array = [];
    for (let i = 0; i < values.length / 2; i++) {
      array.push(values[i * 2 + index]);
    }
    data.datasets.push({
      name: category,
      values: array
    });
  });

  const chart = new Chart("#chart", {
    title: `Births and deaths in ${name}`,
    data: data,
    type: "bar",
    height: 450,
    colors: ["#63d0ff", "#363636"]
  });
};

buildChart();
