import React, { useState, useEffect } from "react";
import {useHistory} from "react-router-dom";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {set} from "object-path-immutable";

import {Button, Tree, Typography} from "antd";
import "antd/es/button/style/css";
import "antd/es/tree/style/css";
import "antd/es/typography/style/css";

import {
  LoadingOutlined,
  CheckOutlined,
  DownOutlined,
  EllipsisOutlined,
  HomeOutlined,
  ExperimentOutlined,
  DatabaseOutlined,
  TableOutlined,
} from "@ant-design/icons";
import {get, listChildren, listSamples} from "../../modules/containers/actions";

const {Text} = Typography;

const iconRules = [
  { match: /room/i,    icon: () => <HomeOutlined /> },
  { match: /freezer/i, icon: () => <DatabaseOutlined /> },
  { match: /rack/i,    icon: () => <TableOutlined /> },
  { match: /plate/i,   icon: () => <TableOutlined /> },
  { match: /tube/i,    icon: () => <ExperimentOutlined /> },
];

const defaultIcon = <TableOutlined />;

const getIcon = container => {
  const rule = iconRules.find(r => r.match.test(container.kind))
  return rule ? rule.icon : defaultIcon
}

const entryStyle = { marginLeft: '0.5em' };

const loadingEntry = id => ({
  title: <span style={entryStyle}>
    <strong>{id}</strong>{' '}
    <Text type="secondary">loading...</Text>
  </span>,
  icon: <LoadingOutlined />,
  key: id,
})

const buildContainerTreeFromPath = (context, path) => {
  if (path.length === 0)
    return [];

  const id = path[0];

  const container = context.containersByID[id];
  const isExploded = context.explodedKeys[id] === true;
  const isLoaded = container && container.isLoaded;
  const isFetching = container && container.isFetching;

  if (!isLoaded) {
    return loadingEntry(id);
  }

  const otherChildren = container.children.filter(id => id !== path[1]);
  // length - (path.length === 1 ? 0 : 1);
  const samples = container.samples;

  const title = <span style={entryStyle}>
    <strong>{container.name}</strong>{' '}
    <Text type="secondary">
      {container.kind}
    </Text>{' '}
    {container.coordinates &&
      <Text type="secondary">
        @ {container.coordinates}
      </Text>
    }
  </span>;

  const icon = getIcon(container);

  const children = buildContainerTreeFromPath(context, path.slice(1));

  if (otherChildren.length) {
    if (!isExploded) {
      children.push({
        title: <span style={entryStyle}>
          <Text type="secondary">
            {otherChildren.length}{path.length === 1 ? '' : ' other'} container{otherChildren.length === 1 ? '' : 's'}{' '}
            (click to expand)
          </Text>
        </span>,
        icon: isFetching ? <LoadingOutlined /> : <EllipsisOutlined />,
        key: `${container.id}$children`,
      })
    }
    else {
      children.push(...otherChildren.map(containerId =>
        buildContainerTreeFromPath(context, [containerId])
      ).flat())
    }
  }

  if (samples.length) {
    if (!isExploded) {
      children.push({
        title: <span style={entryStyle}>
          <Text type="secondary">
            {samples.length} sample{samples.length === 1 ? '' : 's'}{' '}
            (click to expand)
          </Text>
        </span>,
        icon: <EllipsisOutlined />,
        key: `${container.id}$samples`,
      })
    }
    else {
      children.push(...samples.map(sampleId => {
        const sample = context.samplesByID[sampleId];
        if (!sample)
          return loadingEntry(sampleId);
        return {
          title: <span style={entryStyle}>
            <strong>{sample.name}</strong>{' '}
            <Text type="secondary">
              sample ({sample.biospecimen_type})
            </Text>
          </span>,
          icon: <CheckOutlined />,
          key: sampleId,
          type: 'sample',
        };
      }))
    }
  }

  return [{
    title,
    icon,
    key: container.id,
    children,
  }];
};

const mapStateToProps = state => ({
  containersByID: state.containers.itemsByID,
  samplesByID: state.samples.itemsByID,
});

const mapDispatchToProps = dispatch =>
    bindActionCreators({get, listChildren, listSamples}, dispatch)

const ContainerHierarchy = ({container, containersByID, samplesByID, listChildren, listSamples}) => {
  if (!container || !container.parents)
    return <LoadingOutlined />;

  const history = useHistory();

  const [explodedKeys, setExplodedKeys] = useState({});
  useEffect(() => { setExplodedKeys({}) }, [container.id]);

  const context = {
    containersByID,
    samplesByID,
    explodedKeys,
  }
  const path = container.parents.concat([container.id]);
  const tree = buildContainerTreeFromPath(context, path);

  const onSelect = (selectedKeys, { node }) => {
    const [selectedKey] = selectedKeys
    // Explode collapsed nodes
    if (/\$(children|samples)/.test(selectedKey)) {
      const id = selectedKey.replace(/\$(children|samples)/, '');
      const hasChildren = selectedKey.endsWith('$children')
      if (hasChildren)
        listChildren(id, path)
      else
        listSamples(id)
      setExplodedKeys(set(explodedKeys, [id], true));
    }
    // Navigate to container
    else {
      if (node.type === 'sample')
        history.push(`/samples/${selectedKey}`);
      else
        history.push(`/containers/${selectedKey}`);
    }
  }

  return (
    <Tree
      showIcon
      showLine
      className="ant-tree-show-line-no-icon"
      switcherIcon={<DownOutlined />}
      selectedKeys={[path[path.length - 1]]}
      treeData={tree}
      defaultExpandedKeys={container.parents}
      onSelect={onSelect}
    />
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ContainerHierarchy);
