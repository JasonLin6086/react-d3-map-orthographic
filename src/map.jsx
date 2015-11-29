"use strict"

import {
  default as React,
  Component,
  PropTypes
} from 'react';

import {
  Chart,
  projection as projectionFunc,
  geoPath,
  tileFunc,
  ZoomControl
} from 'react-d3-map-core';

import {
  default as CommonProps,
} from './commonProps';

import {
  Vector
} from 'react-d3-map';

import {
  default as OrthographicController
} from './orthographic_controller'

export default class Map extends Component {
  constructor(props) {
    super(props);

    const {
      center
    } = props;

    this.state = {
      zoomTranslate: null,
      scale: this.props.scale,
      times: 1,
      globalRotate: [-center[0], -center[1]]
    };
  }

  static defaultProps = CommonProps

  static childContextTypes = {
    geoPath: React.PropTypes.func.isRequired,
    projection: React.PropTypes.func.isRequired
  }

  getChildContext() {
    return {
      geoPath: this.geoPath,
      projection: this.projection
    };
  }

  onZoom(zoomScale, zoomTranslate) {

    var times = this.state.times;

    this.setState({
      scale: zoomScale * times,
      zoomTranslate: zoomTranslate
    })
  }

  zoomIn() {
    var times = this.state.times;

    this.setState({
      times: times * 2,
      scale: this.state.scale * 2
    })
  }

  zoomOut() {
    var times = this.state.times;

    this.setState({
      times: times / 2,
      scale: this.state.scale / 2
    })
  }

  render() {
    const {
      scale,
      zoomTranslate,
      globalRotate
    } = this.state;

    const {
      width,
      height,
      cWidth,
      cHeight,
      center,
      projection,
      simplify,
      simplifyArea,
      clip,
      bounds,
      data,
      popupContent,
      controllerScale
    } = this.props;

    var onZoom = this.onZoom.bind(this);
    var zoomIn = this.zoomIn.bind(this);
    var zoomOut = this.zoomOut.bind(this);

    var translate = [width / 2, height / 2] || this.props.translate;

    var proj = projectionFunc({
      projection: projection,
      scale: scale / 2 / Math.PI,
      translate: zoomTranslate || translate,
      center: center,
      simplify: simplify,
      simplifyArea: simplifyArea,
      clip: clip,
      bounds: bounds
    });
    var geo = geoPath(proj);

    this.projection = proj;
    this.geoPath = geo;

    var tiles = tileFunc({
      scale: proj.scale() * 2 * Math.PI,
      translate: proj([0, 0]),
      size: ([width, height])
    });

    var styleContainer = {
      position: 'relative',
      backgroundColor: '#EEE',
      width: width
    }

    //map dims
    var mapDim = {
      topLine: [],
      bottomLine: []
    };

    mapDim.topLine.push(proj.invert([0, 0]))
    mapDim.topLine.push(proj.invert([width, 0]))
    mapDim.bottomLine.push(proj.invert([width, height]))
    mapDim.bottomLine.push(proj.invert([0, height]))

    return (
      <div style= {styleContainer}>
        <Chart
          {...this.props}
          width= {width}
          height= {height}
          projection = {proj}
          onZoom= {onZoom}
          center= {center}
        >
          <Vector
            {...this.props}
            tiles= {tiles}
            data= {data}
            {...this.state}
          >
            {this.props.children}
          </Vector>
        </Chart>
        <OrthographicController
          {...this.props}
          mapDim= {mapDim}
          controllerScale= {controllerScale}
          controllerCenter= {center}
          cWidth= {cWidth}
          cHeight= {cHeight}
          center= {center}
          translate= {zoomTranslate}
          globalRotate= {globalRotate}
        >
          {this.props.children}
        </OrthographicController>
        <ZoomControl
          zoomInClick= {zoomIn}
          zoomOutClick= {zoomOut}
        />
      </div>
    )

  }
}
