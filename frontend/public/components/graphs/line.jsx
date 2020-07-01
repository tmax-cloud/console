import * as _ from 'lodash-es';
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { restyle } from 'plotly.js/lib/core';
import { withTranslation } from 'react-i18next';
import { BaseGraph } from './base';
import { connectToURLs, MonitoringRoutes } from '../../monitoring';

const baseData = {
  x: [],
  y: [],
  mode: 'lines',
  fill: 'tozeroy',
  type: 'scatter',
};

export class Line_ extends BaseGraph {
  constructor(props) {
    super(props);
    const { t } = props;
    let queries = props.query;
    if (!_.isArray(queries)) {
      queries = [queries];
    }
    this.data = queries.map(() => Object.assign({}, baseData));
    this.layout = {
      xaxis: {
        visible: false,
      },
      yaxis: {
        visible: false,
      },
      annotations: [
        {
          text: t('STRING:LINE_0'),
          xref: 'paper',
          yref: 'paper',
          showarrow: false,
          font: {
            size: 28,
          },
        },
      ],
    };
    this.options = {
      displaylogo: false,
      displayModeBar: false,
    };
    this.style = { width: '100%' };
    this.onPlotlyRelayout = e => {
      if (!e) {
        console.log('error');
        return;
      }
      let start = this.start;
      let end = this.end;
      if (e['xaxis.autorange']) {
        end = null;
        start = null;
      } else if (e['xaxis.range[1]'] && e['xaxis.range[0]']) {
        end = new Date(e['xaxis.range[1]']).getTime();
        start = new Date(e['xaxis.range[0]']).getTime();
      }
      if (start === this.start && end === this.end) {
        return;
      }
      this.start = start;
      this.end = end;
      clearInterval(this.interval);
      this.fetch();
    };
  }

  componentDidMount() {
    super.componentDidMount();
    this.node.on('plotly_relayout', this.onPlotlyRelayout);
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.node.removeListener('plotly_relayout', this.onPlotlyRelayout);
  }
  updateGraph2(data, target) {
    let queries = this.props.query;
    let nticks = data.length <= 5 ? data.length : 5;
    const { t } = this.props;
    if (!_.isArray(queries)) {
      queries = [
        {
          query: queries,
          name: this.props.title,
        },
      ];
    }
    if (data.length === 0) {
      this.node.layout = {
        xaxis: {
          visible: false,
        },
        yaxis: {
          visible: false,
        },
        annotations: [
          {
            text: t('STRING:LINE_1'),
            xref: 'paper',
            yref: 'paper',
            showarrow: false,
            font: {
              size: 28,
            },
          },
        ],
      };
      restyle(this.node, {
        x: [],
        y: [],
        name,
      }).catch(e => {
        // eslint-disable-next-line no-console
        console.error(e);
      });
      return;
    }
    this.node.layout = {
      dragmode: 'pan',
      yaxis: {
        visible: true,
        rangemode: 'tozero',
        zeroline: false,
        ticks: '',
        showline: false,
        fixedrange: true,
        automargin: true,
      },
      xaxis: {
        visible: true,
        zeroline: false,
        showline: true,
        tickmode: 'auto',
        nticks: nticks,
        fixedrange: true, // true인경우 zoom불가
        automargin: true,
      },
      legend: {
        x: 0,
        y: 1,
        bgcolor: 'rgba(255, 255, 255, 0.5)',
        size: '12px',
        orientation: 'h',
      },
      margin: {
        l: 30,
        b: 30,
        r: 40,
        t: 0,
        pad: 0,
      },
      shapes: [],
    };
    switch (this.props.query[0].timeUnit) {
      case 'hour':
        this.node.layout.xaxis.tickformat = '%H:%M';
        break;
      case 'day':
        this.node.layout.xaxis.tickformat = '%m/%d';
        break;
      case 'month':
        this.node.layout.xaxis.tickformat = '%B';
        break;
      case 'year':
        this.node.layout.xaxis.tickformat = '%Y';
        break;
      default:
        break;
    }
    data
      .forEach((cur, i) => {
        restyle(
          this.node,
          {
            x: [data.map(v => new Date(v.meteringTime))],
            y: [data.map(v => v[target])],
            // Use a lighter fill color on first line in graphs
            fillcolor: i === 0 ? 'rgba(31, 119, 190, 0.3)' : undefined,
            name,
          },
          [i],
        );
      })
      .catch(e => {
        // eslint-disable-next-line no-console
        console.error(e);
      });
  }

  updateGraph(data) {
    let queries = this.props.query;
    const { t } = this.props;
    if (!_.isArray(queries)) {
      queries = [
        {
          query: queries,
          name: this.props.title,
        },
      ];
    }
    _.each(data, (result, i) => {
      const query = queries[i];
      const name = query && query.name;
      if (result.data.result.length === 0) {
        // eslint-disable-next-line no-console
        console.warn(`Graph error: No data from query for ${name || query}.`);
        this.node.layout = {
          xaxis: {
            visible: false,
          },
          yaxis: {
            visible: false,
          },
          annotations: [
            {
              text: t('STRING:LINE_1'),
              xref: 'paper',
              yref: 'paper',
              showarrow: false,
              font: {
                size: 28,
              },
            },
          ],
        };
        restyle(
          this.node,
          {
            x: [],
            y: [],
            name,
          },
          [i],
        ).catch(e => {
          // eslint-disable-next-line no-console
          console.error(e);
        });
        return;
      }
      const lineValues = result.data.result[0].values;
      this.node.layout = {
        dragmode: 'pan',
        yaxis: {
          visible: true,
          rangemode: 'tozero',
          zeroline: false,
          ticks: '',
          showline: false,
          fixedrange: true,
          automargin: true,
        },
        xaxis: {
          visible: true,
          zeroline: false,
          showline: true,
          tickformat: '%H:%M',
          fixedrange: true, // true인경우 zoom불가
          automargin: true,
        },
        legend: {
          x: 0,
          y: 1,
          bgcolor: 'rgba(255, 255, 255, 0.5)',
          size: '12px',
          orientation: 'h',
        },
        margin: {
          l: 30,
          b: 40,
          r: 40,
          t: 10,
          pad: 0,
        },
        shapes: [],
      };
      restyle(
        this.node,
        {
          x: [lineValues.map(v => new Date(v[0] * 1000))],
          y: [lineValues.map(v => (v[1] === 'NaN' ? null : Number(v[1])))],
          // Use a lighter fill color on first line in graphs
          fillcolor: i === 0 ? 'rgba(31, 119, 190, 0.3)' : undefined,
          name,
        },
        [i],
      ).catch(e => {
        // eslint-disable-next-line no-console
        console.error(e);
      });
    });
  }
}
export const Line = withTranslation()(connectToURLs(MonitoringRoutes.Prometheus)(Line_));

Line_.contextTypes = {
  urls: PropTypes.object,
};
