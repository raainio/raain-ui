import {PolarMapValue} from '../tools/PolarMapValue';
import {CartesianMapValue} from '../tools/CartesianMapValue';

export class FrameContainer {

    constructor(public date: Date,
                public values: PolarMapValue[] | CartesianMapValue[],
                public isPolar: boolean = false,
                public isCartesian: boolean = false,
                public isIcon: boolean = false) {
    }

}
