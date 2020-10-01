import {combineReducers} from 'redux'
import {reducer as toastr} from 'react-redux-toastr'

import C from '../constants.js'
import pieces from './pieces.js'
import pages from './pages.js'
import i18n from './i18n.js'

const global = (state = {}, action) => {
    switch (action.type) {
        case C.NAVBAR_COLLAPSE:
            return {...state, navBarCollapsed: true};

        case C.NAVBAR_EXPAND:
            return {...state, navBarCollapsed: false};

        case C.EXPERT_MODE:
            return {...state, expert: action.payload};

        case C.GLOBAL_SHOW_MESSAGE:
            return {...state, message: action.message};
        default:
            return state
    }
};

const reducers = combineReducers({
    pieces, pages, i18n, toastr, global
});


export default reducers