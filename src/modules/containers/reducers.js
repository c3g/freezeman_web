import {objectsByProperty} from "../../utils/objects";

import {FETCH_CONTAINER, FETCH_CONTAINER_KINDS, FETCH_CONTAINERS} from "./actions";

export const containerKinds = (
    state = {
        items: [],
        itemsByID: {},
        isFetching: false,
        lastUpdated: null,
    },
    action
) => {
    switch (action.type) {
        case FETCH_CONTAINER_KINDS.REQUEST:
            return {
                ...state,
                isFetching: true,
            };
        case FETCH_CONTAINER_KINDS.RECEIVE:
            return {
                ...state,
                items: action.data,
                itemsByID: objectsByProperty(action.data, "id"),
                lastUpdated: action.receivedAt,
            };
        case FETCH_CONTAINER_KINDS.FINISH:
            return {
                ...state,
                isFetching: false,
            };
        default:
            return state;
    }
}

export const containers = (
    state = {
        items: [],
        itemsByBarcode: {},
        serverCount: 0,  // For pagination
        isFetching: false,
        isFetchingBarcodes: [],
        didInvalidate: false,
        lastUpdated: null,
    },
    action
) => {
    switch (action.type) {
        case FETCH_CONTAINERS.REQUEST:
            return {
                ...state,
                isFetching: true,
            };
        case FETCH_CONTAINERS.RECEIVE:
            return {
                ...state,
                items: action.data,
                itemsByBarcode: objectsByProperty(action.data, "barcode"),
                serverCount: action.data.length,
                didInvalidate: false,
                lastUpdated: action.receivedAt,
            };
        case FETCH_CONTAINERS.FINISH:
            return {
                ...state,
                isFetching: false,
            };

        case FETCH_CONTAINER.REQUEST:
            return {
                ...state,
                isFetchingBarcodes: [...state.isFetchingBarcodes, action.params.barcode],
            };
        case FETCH_CONTAINER.RECEIVE: {
            const items = [...state.items.filter(c => c.barcode !== action.params.barcode), action.data];
            return {
                ...state,
                items,
                itemsByBarcode: {
                    ...state.itemsByBarcode,
                    [action.params.barcode]: action.data,
                },
                serverCount: items.length
            };
        }
        case FETCH_CONTAINER.FINISH:
            return {
                ...state,
                // TODO: Update server count here instead?
                isFetchingBarcodes: state.isFetchingBarcodes.filter(b => b !== action.params.barcode),
            };

        default:
            return state;
    }
};
