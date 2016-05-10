/*
 * This file is part of the nivo library.
 *
 * (c) Raphaël Benitte
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
'use strict';

import d3                       from 'd3';
import _                        from 'lodash';
import { DIRECTION_HORIZONTAL } from '../../../constants/directions';


const monthPathGenerator = (date, cellSize, daySpacing, direction) => {
    const t1 = new Date(date.getFullYear(), date.getMonth() + 1, 0); // first day of next month
    const d0 = date.getDay();            // first day of month
    const w0 = d3.time.weekOfYear(date); // first week of month
    const d1 = t1.getDay();              // last day of month
    const w1 = d3.time.weekOfYear(t1);   // last week of month

    if (direction === DIRECTION_HORIZONTAL) {
        return [
            `M${(w0 + 1) * (cellSize + daySpacing)},${d0 * (cellSize + daySpacing)}`,
            `H${w0 * (cellSize + daySpacing)}V${7 * (cellSize + daySpacing)}`,
            `H${w1 * (cellSize + daySpacing)}V${(d1 + 1) * (cellSize + daySpacing)}`,
            `H${(w1 + 1) * (cellSize + daySpacing)}V0`,
            `H${(w0 + 1) * (cellSize + daySpacing)}Z`
        ].join('');
    }

    return [
        `M${d0 * (cellSize + daySpacing)},${(w0 + 1) * (cellSize + daySpacing)}`,
        `H0V${(w1 + 1) * (cellSize + daySpacing)}`,
        `H${(d1 + 1) * (cellSize + daySpacing)}V${w1 * (cellSize + daySpacing)}`,
        `H${7 * (cellSize + daySpacing)}V${w0 * (cellSize + daySpacing)}`,
        `H${d0 * (cellSize + daySpacing)}Z`
    ].join('');
};


/**
 * This layout is responsible for computing Calendar chart data/positions….
 * It's used for all Calendar related chart components.
 *
 * @returns {{ compute: (function) }}
 * @constructor
 */
const CalendarLayout = () => {
    return {
        /**
         * @param {number} width
         * @param {number} height
         * @param {string} direction
         * @param {number} daySpacing
         * @returns {object}
         */
        compute({
            width, height,
            direction,
            daySpacing
        }) {

            // time related data
            const startDate = new Date(2005, 0, 1);
            const endDate   = new Date(2006, 0, 1);
            const days      = d3.time.days(startDate, endDate);
            const months    = d3.time.months(startDate, endDate);
            const weekCount = d3.time.weekOfYear(days[days.length - 1]);

            let cellSize;
            if (direction === DIRECTION_HORIZONTAL) {
                cellSize = (width - daySpacing * (weekCount + 2)) / (weekCount + 1);
            } else {
                cellSize = (height - daySpacing * (weekCount + 2)) / (weekCount + 1);
            }

            let cellPosition;
            if (direction === DIRECTION_HORIZONTAL) {
                cellPosition = d => ({
                    x: d3.time.weekOfYear(d) * (cellSize + daySpacing) + daySpacing / 2,
                    y: d.getDay() * (cellSize + daySpacing) + daySpacing / 2,
                });
            } else {
                cellPosition = d => ({
                    x: d.getDay() * (cellSize + daySpacing) + daySpacing / 2,
                    y: d3.time.weekOfYear(d) * (cellSize + daySpacing) + daySpacing / 2,
                });
            }

            return {
                days: days.map(dayDate => {
                    return _.assign({
                        date: dayDate,
                        cellSize,
                    }, cellPosition(dayDate));
                }),
                months: months.map(monthDate => {
                    return {
                        date: monthDate,
                        path: monthPathGenerator(monthDate, cellSize, daySpacing, direction),
                    }
                })
            };
        }
    }
};


export default CalendarLayout;
