import { combineReducers } from 'redux'
// import {
//     ADD_TODO,
//     TOGGLE_TODO,
//     SET_VISIBILITY_FILTER,
//     VisibilityFilters
// } from './actions'
// const { SHOW_ALL } = VisibilityFilters

// function visibilityFilter(state = SHOW_ALL, action) {
//     switch (action.type) {
//         case SET_VISIBILITY_FILTER:
//             return action.filter
//         default:
//             return state
//     }
// }

const ACTION_ADD_MEMBER = 'member_add';

const defaultState = [];

function members(state = defaultState, action) {
    switch (action.type) {
        case ACTION_ADD_MEMBER:
            return [
                ...state,
                {
                    text: action.text,
                }
            ];
        // case TOGGLE_TODO:
        //     return state.map((todo, index) => {
        //         if (index === action.index) {
        //             return Object.assign({}, todo, {
        //                 completed: !todo.completed
        //             })
        //         }
        //         return todo
        //     })
        default:
            return state
    }
}

export default members