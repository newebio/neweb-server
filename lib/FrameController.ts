import { BehaviorSubject } from "rxjs";

class FrameController {
    public data$ = new BehaviorSubject<{}>({});
}
export default FrameController;
