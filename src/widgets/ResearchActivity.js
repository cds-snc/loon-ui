/** @jsx jsx */
import { jsx, css } from "@emotion/core";
import React from "react";
import { WidgetTitle, StyledCell } from "../styles";
import { Loader } from "../Loader";
import * as d3 from "d3";
import BarChart from "./BarChart";

let width = 0;
let height = 200;
let margin = {
  top: 20,
  right: 30,
  bottom: 30,
  left: 40
};

const chartStyle = css`
  font-size: 12px;
  text-align: left;
`;
const topMatter = css`
  color: white;
  min-height: 30px;
  margin-top: 10px;
  margin-left: ${margin.left}px;
`;
const chartId = "research-activity";

export default class ResearchActivity extends React.Component {

  state={counter: 0};
  constructor(props) {
    super(props);
    let channel = props.socket.channel("data_source:usability_testing", {});

    channel.join().receive("error", (resp) => {
      console.log("Unable to join: ", resp);
    });
    channel.on("data", (payload) => {
      this.setState({ payload: payload });
    });
  }

  getData = () => {
    var parseTime = d3.timeParse("%Y-%m");

    if (!this.state || !this.state.payload) {
      return [];
    }
    let { data } = this.state.payload;
    data = data.records
      .map(x => x.fields)
      .filter(x => x.Product !== undefined ? x.Product.indexOf("VAC") > -1 : false)
      .map(x => {
        var parsedTime = parseTime(x.When);
        x.startDate = new Date(parsedTime.getFullYear(), parsedTime.getMonth(), 1);
        x.endDate = new Date(parsedTime.getFullYear(), parsedTime.getMonth() + 1, 0);
        x.value = +x["Total parts."];
        x.method = x["Method"];
        x.questions = x["Research questions"];
        return x;
      })
    const allWhens = Array.from(new Set(data.map(x => x.When)));
    allWhens.forEach(x => {
      var total = 0;
      data.filter(d => d.When === x)
        .map(d => {
          d.v0 = total;
          total += d.value;
          d.v1 = total;
          return d;
        });
    })
    data.sort(function(a, b){return a.startDate - b.startDate});
    return data;
  };

  componentDidUpdate() {
    let svg = document.getElementById(chartId);
    const newWidth = svg.clientWidth || svg.parentNode.clientWidth;
      if(Math.abs(newWidth - width) > 5) {
        this.setState({counter: this.state.counter + 1});
      }
  }

  render() {
    const { area, t } = this.props;
    if (!this.state || !this.state.payload) {
      return (
        <Loader t={t}/>
      );
    }
    let svg = document.getElementById(chartId);
    if (svg){
      width = svg.clientWidth || svg.parentNode.clientWidth;
    }

    let data = this.getData();
    let x = d3.scaleTime()
      .domain([new Date(2018, 2, 1), new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)])
      .range([margin.left, width - margin.right])
    let y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.v1)]).nice()
      .range([height - margin.bottom, margin.top]);

    d3.select("#" + chartId + " .x-axis")
      .call(d3.axisBottom(x).ticks(5).tickSizeOuter(0))
      .attr("font-size", 12);

    d3.select("#" + chartId + " .y-axis")
      .call(d3.axisLeft(y).ticks(5))
      .call(g => g.select(".domain").remove())
      .selectAll("line")
      .attr("x1", width - margin.right - margin.left);
    d3.select("#" + chartId + " .y-axis").attr("font-size", 12);

    return (
      <div data-testid={chartId+"-widget"}>
        <WidgetTitle>{t("research_activity_title")}</WidgetTitle>
        <StyledCell area={area} center css={chartStyle}>
          <div aria-hidden="true" css={topMatter}>
            <div id="method"></div>
            <div id="questions"></div>
          </div>
          <svg
            id={chartId}
            width="100%"
            height={height}
            aria-label="Bar chart showing number of research participants each month"
            >
            <BarChart
              data={data}
              x={x}
              y={y}
              height={height}
              margin={margin}
              ariaLabel={
                d => d.startDate.toLocaleString('en-us', { month: 'long' }) + " " + d.startDate.getFullYear().toString() + ": " + d.value.toString() + " research participants, research method: " + d.method + ", research questions: " + d.questions
              }
              mouseover={d => {
                return () => {
                  d3.select("#method").html("Research method: " + d.method)
                  d3.select("#questions").html("Research questions: " + d.questions)
                }
              }}
            />
          </svg>
        </StyledCell>
      </div>
    );
  }
}
