import React, { Component } from "react";
import { AgGridReact } from "ag-grid-react";
import { debounce } from "../../helpers/helpers";

import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine-dark.css";
import "ag-grid-enterprise";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { actions } from "../../reducers/gridActions";

class MyGrid extends Component {
  constructor(props) {
    super(props);

    this.defaultColDef = {
      sortable: true,
      filter: true,
      resizable: true,
      enableValue: true,
      enablePivot: true,
      enableRowGroup: true
    };

    this.debounceSaveGridColumnState = debounce((id, columnState) => {
      this.props.actions.saveGridColumnState(id, columnState);
    }, 100);

    this.debounceSaveGridColumnGroupState = debounce((id, columnGroupState) => {
      this.props.actions.saveGridColumnGroupState(id, columnGroupState);
    }, 100);

    this.debounceSaveGridPivotModeState = debounce((id, isPivotMode) => {
      this.props.actions.saveGridPivotModeState(id, isPivotMode);
    }, 100);
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    // When reloading the page and getting the state from local storage, fetch again the data for the currently displayed grid

    let viewId = this.props.currentViewInfo.id;
    let gridId = this.props.id;
    let url = this.props.url;

    if (this.props.fetchAgain) {
      this.props.actions.fetchGridData(viewId, gridId, url);
    }
  }

  onFilterChanged(params) {
    let filterModel = params.api.getFilterModel();
    this.props.actions.saveGridFilterModel(this.props.id, filterModel);
  }

  onFirstDataRendered(params) {
    let isPivotMode = this.props?.isPivotMode; // boolean
    let isPivotModeDifferent =
      this.gridColumnApi?.isPivotMode() !== this?.props?.isPivotMode;

    let filterModel = this.props?.filterModel;
    let columnState = this.props?.columnState;
    let columnGroupState = this.props?.columnGroupState;

    if (this?.props?.isPivotMode !== undefined && isPivotModeDifferent) {
      this.gridColumnApi.setPivotMode(isPivotMode);
    }

    if (columnState) {
      this.gridColumnApi.applyColumnState({
        state: columnState,
        applyOrder: true
      });
    }

    if (columnGroupState) {
      this.gridColumnApi.setColumnGroupState(columnGroupState);
    }

    if (filterModel) {
      this.gridApi.setFilterModel(filterModel);
    }
  }

  onSaveGridColumnState() {
    if (!this.gridColumnApi) return;
    let columnState = this.gridColumnApi?.getColumnState();
    let columnGroupState = this.gridColumnApi?.getColumnGroupState();

    this.debounceSaveGridColumnState(this.props.id, columnState);
    this.debounceSaveGridColumnGroupState(this.props.id, columnGroupState);
  }

  onSavePivotModeState() {
    let isPivotMode = this.gridColumnApi.isPivotMode();

    let isPivotModeDifferentFromProps =
      this.gridColumnApi.isPivotMode() !== this.props.isPivotMode;
    if (isPivotModeDifferentFromProps)
      this.debounceSaveGridPivotModeState(this.props.id, isPivotMode);
  }

  render() {
    return (
      <div
        style={{ height: "100%", zIndex: 1000 }}
        className={`ag-theme-alpine-dark ${this.props.className}`}
      >
        <AgGridReact
          columnDefs={this.props.columnDefs}
          rowData={this.props.rowData}
          defaultColDef={this.defaultColDef}
          sideBar={true}
          //EVENTS
          onFirstDataRendered={this.onFirstDataRendered.bind(this)}
          onGridReady={this.onGridReady.bind(this)}
          // state change events
          onFilterChanged={this.onFilterChanged.bind(this)}
          onSortChanged={this.onSaveGridColumnState.bind(this)}
          onColumnVisible={this.onSaveGridColumnState.bind(this)}
          onColumnPinned={this.onSaveGridColumnState.bind(this)}
          onColumnResized={this.onSaveGridColumnState.bind(this)}
          onColumnMoved={this.onSaveGridColumnState.bind(this)}
          onColumnRowGroupChanged={this.onSaveGridColumnState.bind(this)}
          onColumnValueChanged={this.onSaveGridColumnState.bind(this)}
          onColumnPivotChanged={this.onSaveGridColumnState.bind(this)}
          onColumnPivotModeChanged={this.onSavePivotModeState.bind(this)}
        ></AgGridReact>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  currentViewInfo: state.currentViewInfo
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(MyGrid);
