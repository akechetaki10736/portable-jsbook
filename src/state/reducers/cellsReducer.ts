import produce from 'immer';
import { ActionTypes } from '../action-types';
import { Action } from '../actions';
import { Cell } from '../cell';

interface CellsState {
    loading: boolean;
    error: string | null;
    order: string[];
    data: {
        [ key: string ]: Cell;
    }
};

const initialState: CellsState  = {
    loading: false,
    error: null,
    order: [], //store cell id in array
    data: {} // store all cell in object, id as key
};

const reducer = produce((state: CellsState = initialState, action: Action) => {
    switch (action.type) {
        case ActionTypes.SAVE_CELLS_ERROR:
            state.error = action.payload;
            return state;
            
        case ActionTypes.FETCH_CELLS:
            state.loading = true;
            state.error = null;
            return state;

        case ActionTypes.FETCH_CELLS_COMPLETE:
            state.order = action.payload.map(cell => cell.id);
            state.data = action.payload.reduce((accumulator, cell) => {
                accumulator[cell.id] = cell;
                return accumulator;
            }, {} as CellsState['data']);
            return state;

        case ActionTypes.FETCH_CELLS_ERROR:
            state.loading = false;
            state.error = action.payload;
            return state;

        case ActionTypes.UPDATE_CELL:
            const { id, content } = action.payload;
            state.data[id].content = content;
            return state;

        case ActionTypes.DELETE_CELL:
            delete state.data[action.payload];
            state.order = state.order.filter((id) => id !== action.payload);
            return state;

        case ActionTypes.MOVE_CELL:
            const { direction } = action.payload;
            const index = state.order.findIndex((id) => id === action.payload.id);
            const targetIndex = direction === 'up' ? index - 1 : index + 1;

            if (targetIndex < 0 || targetIndex > state.order.length - 0) {
                return state;
            }

            state.order[index] = state.order[targetIndex];
            state.order[targetIndex] = action.payload.id;

            return state;

        case ActionTypes.INSERT_CELL_AFTER:
            const cell: Cell = {
                content: '',
                type: action.payload.type,
                id: randomId()
            };

            state.data[cell.id] = cell;

            const foundIndex = state.order.findIndex((id) => id === action.payload.id);
            if (foundIndex < 0) {
                state.order.unshift(cell.id)
            } else {
                state.order.splice(foundIndex + 1, 0, cell.id);
            }

            return state;

        default:
            return state;
    }
}, initialState);

const randomId = () => {
    return Math.random().toString(36).substring(2, 7);
}

export default reducer;