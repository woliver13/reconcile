import { SampleDataService } from './sampleDataService';
import { TableView } from './tableView';
import { Reconciler } from './reconciler';
import { Scorer } from './scorer';
import 'bootstrap/dist/css/bootstrap.min.css';

const WEIGHTS = { EXACT: 100, WHITESPACE: 80, NICKNAME: 60, CONTAINS: 30, TRANSPOSITION: 20 };

const container = document.querySelector<HTMLElement>('.reconcile')!;

const service = new SampleDataService();
const scorer  = new Scorer(WEIGHTS);
const view    = new TableView(container, WEIGHTS);
const reconciler = new Reconciler(service, view, scorer);

reconciler.init().catch(err => view.showError(err));
