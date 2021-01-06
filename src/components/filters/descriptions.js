import {FILTER_TYPE, BIOSPECIMEN_TYPE} from "../../constants";

export const SAMPLE_FILTERS = {
  name__icontains: {
    type: FILTER_TYPE.INPUT,
    key: "name__icontains",
    label: "Name",
    width: 250,
    displayByDefault: true,
  },
  container__barcode__icontains: {
    type: FILTER_TYPE.INPUT,
    key: "container__barcode__icontains",
    label: "Container Barcode",
    width: 250,
    displayByDefault: true,
  },
  biospecimen_type__in: {
    type: FILTER_TYPE.SELECT,
    key: "biospecimen_type__in",
    label: "Type",
    mode: "multiple",
    placeholder: "All",
    options: BIOSPECIMEN_TYPE.map(x => ({ label: x, value: x })),
    displayByDefault: true,
  },
  individual__label__icontains: {
    type: FILTER_TYPE.INPUT,
    key: "individual__label__icontains",
    label: "Individual Label",
    width: 250,
    displayByDefault: false,
  },
  individual__pedigree__icontains: {
    type: FILTER_TYPE.INPUT,
    key: "individual__pedigree__icontains",
    label: "Individual Pedigree",
    width: 250,
    displayByDefault: false,
  },
  individual__cohort__icontains: {
    type: FILTER_TYPE.INPUT,
    key: "individual__cohort__icontains",
    label: "Individual Cohort",
    width: 250,
    displayByDefault: false,
  },
  individual__sex__in: {
    type: FILTER_TYPE.SELECT,
    key: "individual__sex__in",
    label: "Individual Sex",
    mode: "multiple",
    placeholder: "All",
    options: [
      { label: "Female",  value: "F" },
      { label: "Male",    value: "M" },
      { label: "Unknown", value: "Unknown" },
    ],
    displayByDefault: false,
  },
  container__name__icontains: {
    type: FILTER_TYPE.INPUT,
    key: "container__name__icontains",
    label: "Container Name",
    width: 250,
    displayByDefault: false,
  },
  collection_site__icontains: {
    type: FILTER_TYPE.INPUT,
    key: "collection_site__icontains",
    label: "Collection site",
    width: 250,
    displayByDefault: false,
  },
  depleted: {
    type: FILTER_TYPE.SELECT,
    key: "depleted",
    label: "Depleted",
    placeholder: "All",
    options: [
      { label: "Yes", value: "true" },
      { label: "No",  value: "false"},
    ],
    displayByDefault: false,
  },
  concentration: {
    type: FILTER_TYPE.RANGE,
    key: "concentration",
    label: "Concentration",
    displayByDefault: false,
  },
}

export const CONTAINER_FILTERS = {
  barcode: {
    type: FILTER_TYPE.INPUT,
    key: "barcode__icontains",
    label: "Barcode",
    width: 250,
    displayByDefault: true,
  },
  name: {
    type: FILTER_TYPE.INPUT,
    key: "name__icontains",
    label: "Name",
    width: 250,
    displayByDefault: false,
  },
  kind: {
    type: FILTER_TYPE.SELECT,
    key: "kind__in",
    label: "Kind",
    mode: "multiple",
    placeholder: "All",
    displayByDefault: false,
  },
  coordinates: {
    type: FILTER_TYPE.INPUT,
    key: "coordinates__icontains",
    label: "Coordinates",
    width: 80,
    displayByDefault: false,
  },
  samples: {
    type: FILTER_TYPE.INPUT,
    key: "samples__name__icontains",
    label: "Sample name",
    width: 250,
    displayByDefault: false,
  },
}
