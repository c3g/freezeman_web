import React, {useEffect} from "react";
import {connect} from "react-redux";
import {Link} from "react-router-dom";

import {BarcodeOutlined} from "@ant-design/icons";

import AppPageHeader from "../AppPageHeader";
import PageContent from "../PageContent";
import PaginatedTable from "../PaginatedTable";

import {list, listTemplateActions, get as getContainer} from "../../modules/containers/actions";
import {get as getSample} from "../../modules/samples/actions";
import {actionsToButtonList} from "../../utils/templateActions";
import withNestedField from "../../utils/withNestedField";

const CONTAINER_KIND_SHOW_SAMPLE = ["tube"]

const mapStateToProps = state => ({
  containersByID: state.containers.itemsByID,
  containers: state.containers.items,
  samplesByID: state.samples.itemsByID,
  actions: state.containerTemplateActions,
  page: state.containers.page,
  totalCount: state.containers.totalCount,
  isFetching: state.containers.isFetching,
});

const actionCreators = {list, listTemplateActions, getSample, getContainer};

const ContainersListContent = ({
  containers,
  containersByID,
  samplesByID,
  actions,
  isFetching,
  page,
  totalCount,
  list,
  listTemplateActions,
  getSample,
  getContainer,
}) => {
  useEffect(() => {
    // Must be wrapped; effects cannot return promises
    listTemplateActions();
  }, []);

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
    <AppPageHeader title="Containers" extra={actionsToButtonList("/containers", actions)} />
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
