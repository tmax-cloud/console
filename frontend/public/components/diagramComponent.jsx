import * as React from 'react';
import ReactDOM from 'react-dom';
import { mxGraph, mxClient, mxUtils, mxEvent, mxHierarchicalLayout, mxEdgeHandler, mxConstants, mxMorphing, mxGraphView, mxCellState, mxPerimeter } from 'mxgraph-js';

export class PipelineDiagramComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      graph: null,
      tasks: [],
    };
    this.LoadGraph = this.LoadGraph.bind(this);
  }

  componentDidMount() {
    this.setState({
      tasks: this.props.data,
    });
    this.LoadGraph();
  }

  LoadGraph() {
    let container = ReactDOM.findDOMNode(this.refs.divGraph);

    // Checks if the browser is supported
    if (!mxClient.isBrowserSupported()) {
      // Displays an error message if the browser is not supported.
      mxUtils.error('Browser is not supported!', 200, false);
    } else {
      // Disables the built-in context menu
      mxEvent.disableContextMenu(container);

      // Creates the graph inside the given container
      let graph = new mxGraph(container);
      let style = graph.getStylesheet().getDefaultEdgeStyle();
      style[mxConstants.STYLE_CURVED] = '1';

      // Enables rubberband selection
      // new mxRubberband(graph);

      // Gets the default parent for inserting new cells. This is normally the first
      // child of the root (ie. layer 0).
      let parent = graph.getDefaultParent();

      // Enables tooltips, new connections and panning
      // graph.setPanning(true);
      // graph.setTooltips(true);

      graph.setEnabled(false);
      //   graph.setConnectable(true);
      // graph.setEdgeLabelsMovable(false);
      // graph.setVertexLabelsMovable(false);
      // graph.setGridEnabled(true);
      // graph.setAllowDanglingEdges(false);

      function configureStylesheet(graph) {
        var style = new Object();
        style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_IMAGE;
        style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
        style[mxConstants.STYLE_IMAGE] = '../../../../static/assets/fa-question-circle.png';
        style[mxConstants.STYLE_FONTCOLOR] = '#000000';
        graph.getStylesheet().putCellStyle('image', style);

        style = mxUtils.clone(style);
        style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_LABEL;
        style[mxConstants.STYLE_STROKECOLOR] = '#b8bbbe';
        // style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
        // style[mxConstants.STYLE_IMAGE_ALIGN] = mxConstants.ALIGN_CENTER;
        style[mxConstants.STYLE_IMAGE_WIDTH] = '18';
        style[mxConstants.STYLE_IMAGE_HEIGHT] = '18';

        style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_LEFT;
        style[mxConstants.STYLE_IMAGE_ALIGN] = mxConstants.ALIGN_LEFT;
        style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
        style[mxConstants.STYLE_IMAGE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
        style[mxConstants.STYLE_SPACING_LEFT] = '155';
        style[mxConstants.STYLE_SPACING] = '14';

        graph.getStylesheet().putCellStyle('right', style);
      }
      //   configureStylesheet(graph);
      graph.getModel().beginUpdate();
      try {
        //mxGrapg component
        let doc = mxUtils.createXmlDocument();

        this.props.data.forEach(item => {
          item.vertex = graph.insertVertex(parent, null, item.name, 0, 0, 160, 40, 'fontSize=13;fontColor=#000000;rounded=1;fillColor=#ffffff;strokeColor=#b8bbbe;');
        });

        this.props.data.forEach(item => {
          if (item.runAfter !== undefined) {
            item.runAfter.forEach(previousTask => {
              this.props.data.forEach(target => {
                if (target.name === previousTask) {
                  graph.insertEdge(parent, null, '', target.vertex, item.vertex, 'strokeColor=#b8bbbe');
                }
              });
            });
          }

          if (item.resources && item.resources.inputs) {
            item.resources.inputs.forEach(input => {
              if (input.from !== undefined) {
                input.from.forEach(fromResource => {
                  this.props.data.forEach(target => {
                    if (target.name === fromResource) {
                      graph.insertEdge(parent, null, '', target.vertex, item.vertex, 'strokeColor=#b8bbbe');
                    }
                  });
                });
              }
            });
          }
        });
      } finally {
        // Updates the display
        graph.getModel().endUpdate();
      }

      // Enables rubberband (marquee) selection and a handler for basic keystrokes
      // var rubberband = new mxRubberband(graph);
      // var keyHandler = new mxKeyHandler(graph);

      let layout = new mxHierarchicalLayout(graph, mxConstants.DIRECTION_WEST);

      let executeLayout = function (change, post) {
        graph.getModel().beginUpdate();
        try {
          if (change != null) {
            change();
          }

          layout.execute(graph.getDefaultParent());
        } catch (e) {
          throw e;
        } finally {
          // New API for animating graph layout results asynchronously
          let morph = new mxMorphing(graph);
          morph.addListener(
            mxEvent.DONE,
            mxUtils.bind(this, function () {
              graph.getModel().endUpdate();

              if (post != null) {
                post();
              }
            }),
          );

          morph.startAnimation();
        }
      };

      executeLayout();

      let edgeHandleConnect = mxEdgeHandler.prototype.connect;
      mxEdgeHandler.prototype.connect = function (edge, terminal, isSource, isClone, me) {
        edgeHandleConnect.apply(this, arguments);
        executeLayout();
      };

      graph.resizeCell = function () {
        mxGraph.prototype.resizeCell.apply(this, arguments);

        executeLayout();
      };

      graph.connectionHandler.addListener(mxEvent.CONNECT, function () {
        executeLayout();
      });

      graph.addListener(mxEvent.CLICK, (sender, evt) => {
        var e = evt.getProperty('event'); // mouse event
        var cell = evt.getProperty('cell'); // cell may be null

        if (cell != null) {
          // Do something useful with cell and consume the event
          this.state.tasks.forEach(task => {
            if (task.name === cell.value) {
              // task detail로 라우팅
              if (task.taskRef.kind === 'Task') {
                window.location.href = `/k8s/ns/${this.props.namespace}/tasks/${task.taskRef.name}`;
              } else {
                window.location.href = `/k8s/ns/cluster/tasks/${task.taskRef.name}`;
              }
            }
          });
          evt.consume();
          return;
        }
      });

      function updateStyle(state, hover) {
        if (hover) {
          state.style[mxConstants.STYLE_FILLCOLOR] = '#cccccc';
        }
      }

      graph.addMouseListener({
        currentState: null,
        previousStyle: null,
        mouseDown: function (sender, me) {
          if (this.currentState != null) {
            this.dragLeave(me.getEvent(), this.currentState);
            this.currentState = null;
          }
        },
        mouseMove: function (sender, me) {
          if (this.currentState != null && me.getState() == this.currentState) {
            return;
          }

          var tmp = graph.view.getState(me.getCell());

          // Ignores everything but vertices
          if (graph.isMouseDown || (tmp != null && !graph.getModel().isVertex(tmp.cell))) {
            tmp = null;
          }

          if (tmp != this.currentState) {
            if (this.currentState != null) {
              this.dragLeave(me.getEvent(), this.currentState);
            }

            this.currentState = tmp;

            if (this.currentState != null) {
              this.dragEnter(me.getEvent(), this.currentState);
            }
          }
        },
        mouseUp: function (sender, me) {},
        dragEnter: function (evt, state) {
          if (state != null) {
            this.previousStyle = state.style;
            state.style = mxUtils.clone(state.style);
            updateStyle(state, true);
            state.shape.apply(state);
            state.shape.redraw();

            if (state.text != null) {
              state.text.apply(state);
              state.text.redraw();
            }
          }
        },
        dragLeave: function (evt, state) {
          if (state != null) {
            state.style = this.previousStyle;
            updateStyle(state, false);
            state.shape.apply(state);
            state.shape.redraw();

            if (state.text != null) {
              state.text.apply(state);
              state.text.redraw();
            }
          }
        },
      });

      this.setState({
        graph: graph,
      });
    }
  }

  render() {
    return (
      <div style={{ width: '100%' }}>
        <div className="graph-container no-drag" style={{ height: '300px', overflow: 'scroll', marginBottom: '20px', backgroundColor: '#f0f0f0' }} ref="divGraph" id="divGraph" />
        {/* <div style={{ float: 'left', padding: '5px 10px', backgroundColor: '#BCBDBE', marginBottom: '30px' }}>
            <div style={{ float: 'left' }}>
              <SearchPlusIcon style={{ float: 'left', cursor: 'pointer', width: '25px', height: '25px', marginRight: '10px' }} onClick={() => this.state.graph.zoomIn()} />
            </div>
            <div style={{ float: 'left' }}>
              <SearchMinusIcon style={{ cursor: 'pointer', width: '25px', height: '25px' }} onClick={() => this.state.graph.zoomOut()} />
            </div>
          </div> */}
      </div>
    );
  }
}

let _graph = null;
let init = true;
export class PipelineRunDiagramComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks: [],
      //   graph: null,
    };
    this.LoadGraph = this.LoadGraph.bind(this);
    this.graph = null;
  }

  componentDidMount() {
    this.setState({
      data: this.props.data,
    });
    if (this.props.data !== undefined && this.props.data.taskRuns !== undefined) {
      this.LoadGraph();
      init = false;
    }
  }

  componentDidUpdate() {
    if (this.props.data !== undefined && this.props.data.taskRuns !== undefined && init) {
      this.LoadGraph();
      init = false;
    }
  }

  LoadGraph() {
    // console.log(this.state.data);
    let container = ReactDOM.findDOMNode(this.refs.divGraph);

    // Checks if the browser is supported
    if (!mxClient.isBrowserSupported()) {
      // Displays an error message if the browser is not supported.
      mxUtils.error('Browser is not supported!', 200, false);
    } else {
      // Disables the built-in context menu
      mxEvent.disableContextMenu(container);
      // Creates the graph inside the given container
      let graph = new mxGraph(container);
      let style = graph.getStylesheet().getDefaultEdgeStyle();
      style[mxConstants.STYLE_CURVED] = '1';
      _graph = graph;
      //   this.setState({
      //     graph: graph,
      //   });
      // Enables rubberband selection
      // new mxRubberband(graph);

      // Gets the default parent for inserting new cells. This is normally the first
      // child of the root (ie. layer 0).
      let parent = graph.getDefaultParent();

      // Enables tooltips, new connections and panning
      // graph.setPanning(true);
      // graph.setTooltips(true);
      // graph.setConnectable(true);
      graph.setEnabled(false);
      // graph.setEdgeLabelsMovable(false);
      // graph.setVertexLabelsMovable(false);
      // graph.setGridEnabled(true);
      // graph.setAllowDanglingEdges(false);

      let taskArr = [];
      graph.getModel().beginUpdate();
      try {
        //mxGrapg component
        let doc = mxUtils.createXmlDocument();

        let arr = Object.getOwnPropertyNames(this.props.data.taskRuns);
        // console.log(this.props.data);
        this.props.data.pipelineSpec.tasks.forEach(item => {
          let color = 'lightcoral';
          let status = '';
          let icon = '../../../../static/assets/fa-question-circle.png';
          arr.forEach(taskRun => {
            if (this.props.data.taskRuns[taskRun].pipelineTaskName === item.name) {
              item.taskRunName = taskRun;
              if (this.props.data.taskRuns[taskRun].status.conditions) {
                switch (this.props.data.taskRuns[taskRun].status.conditions[0].status) {
                  case 'True':
                    // Success
                    color = 'lightblue';
                    status = 'True';
                    icon = '../../../../static/assets/fa-check-circle.png';
                    break;
                  case 'Unknown':
                    // Running
                    color = 'yellow';
                    status = 'Unknown';
                    icon = '../../../../static/assets/fa-sync-alt.png';
                    break;
                  case 'False':
                    // Error
                    color = 'lightcoral';
                    status = 'Error';
                    icon = '../../../../static/assets/fa-question-circle.png';
                    break;
                  default:
                    color = 'lightcoral';
                    status = 'Unknown';
                    icon = '../../../../static/assets/fa-question-circle.png';
                    break;
                }
              }
            }
          });
          //   item.vertex = graph.insertVertex(parent, null, item.name, 0, 0, 160, 40, `fillColor=${color};strokeColor='#ffffff;fontSize=13;rounded=1;`);
          item.vertex = graph.insertVertex(parent, null, item.name, 0, 0, 160, 40, `shape=label;image=${icon};imageWidth=20;imageHeight=20;spacingLeft=15;` + 'fontSize=13;fontColor=#000000;rounded=1;fillColor=#ffffff;strokeColor=#b8bbbe;');
          item.status = status;
          taskArr.push(item);
        });

        this.props.data.pipelineSpec.tasks.forEach(item => {
          if (item.runAfter !== undefined) {
            item.runAfter.forEach(previousTask => {
              this.props.data.pipelineSpec.tasks.forEach(target => {
                if (target.name === previousTask) {
                  graph.insertEdge(parent, null, '', target.vertex, item.vertex, 'strokeColor=#cccccc');
                }
              });
            });
          }

          if (item.resources && item.resources.inputs) {
            item.resources.inputs.forEach(input => {
              if (input.from !== undefined) {
                input.from.forEach(fromResource => {
                  this.props.data.pipelineSpec.tasks.forEach(target => {
                    if (target.name === fromResource) {
                      graph.insertEdge(parent, null, '', target.vertex, item.vertex, 'strokeColor=#cccccc');
                    }
                  });
                });
              }
            });
          }
        });
      } finally {
        // Updates the display
        graph.getModel().endUpdate();
      }

      // Enables rubberband (marquee) selection and a handler for basic keystrokes
      // var rubberband = new mxRubberband(graph);
      // var keyHandler = new mxKeyHandler(graph);

      let layout = new mxHierarchicalLayout(graph, mxConstants.DIRECTION_WEST);

      let executeLayout = function (change, post) {
        graph.getModel().beginUpdate();
        try {
          if (change != null) {
            change();
          }

          layout.execute(graph.getDefaultParent());
        } catch (e) {
          throw e;
        } finally {
          // New API for animating graph layout results asynchronously
          let morph = new mxMorphing(graph);
          morph.addListener(
            mxEvent.DONE,
            mxUtils.bind(this, function () {
              graph.getModel().endUpdate();

              if (post != null) {
                post();
              }
            }),
          );

          morph.startAnimation();
        }
      };

      executeLayout();

      let edgeHandleConnect = mxEdgeHandler.prototype.connect;
      mxEdgeHandler.prototype.connect = function (edge, terminal, isSource, isClone, me) {
        edgeHandleConnect.apply(this, arguments);
        executeLayout();
      };

      graph.resizeCell = function () {
        mxGraph.prototype.resizeCell.apply(this, arguments);

        executeLayout();
      };

      graph.connectionHandler.addListener(mxEvent.CONNECT, function () {
        executeLayout();
      });

      graph.addListener(mxEvent.CLICK, (sender, evt) => {
        var e = evt.getProperty('event'); // mouse event
        var cell = evt.getProperty('cell'); // cell may be null

        if (cell != null) {
          // Do something useful with cell and consume the event
          //   console.log(cell.value);
          //   console.log(this.state.tasks);
          this.state.tasks.forEach(task => {
            if (task.name === cell.value) {
              // task run detail로 라우팅
              if (task.taskRunName === undefined) {
                return;
              }
              // if (task.taskRef.kind === 'Task') {
              window.location.href = `/k8s/ns/${this.props.namespace}/taskruns/${task.taskRunName}`;
              // } else {
              // window.location.href = `/k8s/ns/cluster/taskruns/${task.taskRunName}`;
              // }
            }
          });
          evt.consume();
          return;
        }
      });

      function updateStyle(state, hover) {
        if (hover) {
          state.style[mxConstants.STYLE_FILLCOLOR] = '#cccccc';
        }
      }

      graph.addMouseListener({
        currentState: null,
        previousStyle: null,
        mouseDown: function (sender, me) {
          if (this.currentState != null) {
            this.dragLeave(me.getEvent(), this.currentState);
            this.currentState = null;
          }
        },
        mouseMove: function (sender, me) {
          if (this.currentState != null && me.getState() == this.currentState) {
            return;
          }

          var tmp = graph.view.getState(me.getCell());

          // Ignores everything but vertices
          if (graph.isMouseDown || (tmp != null && !graph.getModel().isVertex(tmp.cell))) {
            tmp = null;
          }

          if (tmp != this.currentState) {
            if (this.currentState != null) {
              this.dragLeave(me.getEvent(), this.currentState);
            }

            this.currentState = tmp;

            if (this.currentState != null) {
              this.dragEnter(me.getEvent(), this.currentState);
            }
          }
        },
        mouseUp: function (sender, me) {},
        dragEnter: function (evt, state) {
          if (state != null) {
            this.previousStyle = state.style;
            state.style = mxUtils.clone(state.style);
            updateStyle(state, true);
            state.shape.apply(state);
            state.shape.redraw();

            if (state.text != null) {
              state.text.apply(state);
              state.text.redraw();
            }
          }
        },
        dragLeave: function (evt, state) {
          if (state != null) {
            state.style = this.previousStyle;
            updateStyle(state, false);
            state.shape.apply(state);
            state.shape.redraw();

            if (state.text != null) {
              state.text.apply(state);
              state.text.redraw();
            }
          }
        },
      });

      // console.log(taskRunArr);
      this.setState({
        tasks: taskArr,
      });
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { tasks } = prevState;
    let newTasks = null;

    if (nextProps.data === undefined || nextProps.data.taskRuns === undefined) {
      return;
    }

    let arr = Object.getOwnPropertyNames(nextProps.data.taskRuns);
    for (let i = 0; i < tasks.length; i++) {
      arr.forEach(item => {
        if (nextProps.data.taskRuns[item].pipelineTaskName === tasks[i].name) {
          if (nextProps.data.taskRuns[item].status.conditions !== undefined && nextProps.data.taskRuns[item].status.conditions[0].status !== tasks[i].status) {
            newTasks = tasks;
            newTasks[i].status = nextProps.data.taskRuns[item].status.conditions[0].status;
            newTasks[i].taskRunName = item;
            let cellArr = Object.getOwnPropertyNames(_graph.model.cells);
            cellArr.forEach(cell => {
              if (_graph.model.cells[cell].value === newTasks[i].name) {
                // console.log(newTasks[i].name);
                // console.log(_graph.model.cells[cell].getStyle());
                // console.log(_graph.getModel());
                let newColor;
                let newIcon = '../../../../static/assets';
                switch (newTasks[i].status) {
                  case 'True':
                    // Success
                    newColor = 'lightblue';
                    newIcon += '/fa-check-circle.png';
                    break;
                  case 'Unknown':
                    // Running
                    var state = _graph.view.getState(_graph.model.cells[cell]);
                    // console.log(state);
                    // console.log(state.shape);
                    // console.log(state.shape.node.getElementsByTagName('image')[0]);
                    state.shape.node.getElementsByTagName('image')[0].setAttribute('class', 'rotate');
                    // state.shape.node.getElementsByTagName('path')[0].removeAttribute('visibility');
                    // state.shape.node.getElementsByTagName('path')[0].setAttribute('stroke-width', '6');
                    // state.shape.node.getElementsByTagName('path')[0].setAttribute('stroke', 'lightGray');
                    // state.shape.node.getElementsByTagName('path')[1].setAttribute('class', 'flow');
                    newColor = 'yellow';
                    newIcon += '/fa-sync-alt.png';
                    break;
                  case 'False':
                    // Error
                    newColor = 'lightcoral';
                    newIcon += '/fa-question-circle.png';
                    break;
                  default:
                    newColor = 'lightcoral';
                    newIcon += '/fa-question-circle.png';
                    break;
                }

                // let newStyle = mxUtils.setStyle(_graph.model.cells[cell].getStyle(), mxConstants.STYLE_FILLCOLOR, newColor);
                let newStyle = mxUtils.setStyle(_graph.model.cells[cell].getStyle(), mxConstants.STYLE_IMAGE, newIcon);

                let cs = new Array();
                cs[0] = _graph.model.cells[cell];
                _graph.setCellStyle(newStyle, cs);
              }
            });
          }
        }
      });
    }

    if (newTasks === null) {
      return {};
    }

    return {
      tasks: newTasks,
    };
  }

  render() {
    return (
      <div className="graph-container no-drag" style={{ height: '300px', overflow: 'scroll', marginBottom: '20px', backgroundColor: '#f0f0f0' }} ref="divGraph" id="divGraph" />
      // <div style={{ float: 'left', padding: '5px 10px', backgroundColor: '#BCBDBE', marginBottom: '30px' }}>
      //   <div style={{ float: 'left' }}>
      //     <SearchPlusIcon style={{ float: 'left', cursor: 'pointer', width: '25px', height: '25px', marginRight: '10px' }} onClick={() => _graph.zoomIn()} />
      //   </div>
      //   <div style={{ float: 'left' }}>
      //     <SearchMinusIcon style={{ cursor: 'pointer', width: '25px', height: '25px' }} onClick={() => _graph.zoomOut()} />
      //   </div>
      // </div>
    );
  }
}
