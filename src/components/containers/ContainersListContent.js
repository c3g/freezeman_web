import React, {useEffect} from "react";
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import {BarcodeOutlined} from "@ant-design/icons";

import AppPageHeader from "../AppPageHeader";
import PageContent from "../PageContent";
import PaginatedTable from "../PaginatedTable";
import ExportButton from "../ExportButton";

import {list} from "../../modules/containers/actions";
import api, {withToken}  from "../../utils/api"
import {actionsToButtonList} from "../../utils/templateActions";
import withNestedField from "../../utils/withNestedField";

const CONTAINER_KIND_SHOW_SAMPLE = ["tube"]

const mapStateToProps = state => ({
  token: state.auth.tokens.access,
  containersByID: state.containers.itemsByID,
  containers: state.containers.items,
  samplesByID: state.samples.itemsByID,
  actions: state.containerTemplateActions,
  page: state.containers.page,
  totalCount: state.containers.totalCount,
  isFetching: state.containers.isFetching,
});

const actionCreators = {list};

const ContainersListContent = ({
  token,
  containers,
  containersByID,
  samplesByID,
  actions,
  isFetching,
  page,
  totalCount,
  list,
}) => {

  const listExport = () =>
    withToken(token, api.containers.listExport)().then(response => response.data)

  const TABLE_COLUMNS = [
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: <><BarcodeOutlined style={{marginRight: "8px"}} /> Barcode</>,
      dataIndex: "barcode",
      render: (barcode, container) => <Link to={`/containers/${container.id}`}>{barcode}</Link>,
    },
    {
      title: "Sample",
      dataIndex: "samples",
      render: (samples, container) =>
        (CONTAINER_KIND_SHOW_SAMPLE.includes(container.kind) && samples.length > 0) ? 
          <div>
            <ul>{samples.map(sample =>
              <li key={sample}>
                <Link to={`/samples/${sample}`}>
                  {withNestedField(getSample, "name", samplesByID, sample, "Loading...")}
                </Link>
              </li>)}
            </ul>
          </div> : 
          null,
    },
    {
      title: "Kind",
      dataIndex: "kind",
    },
    {
      title: "Location Name",
      dataIndex: "location",
      render: location => location ? withNestedField(getContainer, "name", containersByID, location, "Loading...") : null,
    },
    {
      title: <><BarcodeOutlined style={{marginRight: "8px"}} /> Location Barcode</>,
      dataIndex: "location",
      render: location => location ?
        <Link to={`/containers/${location}`}>
          {withNestedField(getContainer, "barcode", containersByID, location, "Loading...")}
        </Link> :
        null,
    },
  ];

  return <>
    <AppPageHeader title="Containers" extra={[
      <ExportButton exportFunction={listExport} filename="containers"/>,
      ...actionsToButtonList("/containers", actions)
    ]}/>
    <PageContent>
      <PaginatedTable
        columns={TABLE_COLUMNS}
        items={containers}
        itemsByID={containersByID}
        loading={isFetching}
        totalCount={totalCount}
        page={page}
        onLoad={list}
      />
    </PageContent>
  </>;
}

export default connect(mapStateToProps, actionCreators)(ContainersListContent);
