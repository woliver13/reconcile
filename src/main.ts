import { SampleDataService } from './sampleDataService';
import { BootstrapView } from './bootstrapView';
import { Reconciler } from './reconciler';

const WEIGHTS = { EXACT: 100, WHITESPACE: 80, CONTAINS: 30 };

const container = document.querySelector<HTMLElement>('.reconcile')!;
import $ from 'jquery';

const service = new SampleDataService();
const view    = new BootstrapView($(container), WEIGHTS);
const reconciler = new Reconciler(service, view);

reconciler.init();
