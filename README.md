# reconcile
JavaScript UMD controller for manual reconciliation

Manual reconciliation is a part of system integration work.  A set of objects should be in both systems. There will be objects that automated reconciliation misses. This project intends to address that last set.

The project contains a reconciliation controller. It also contains a view that depends on jQuery and Twitter Bootstrap.

You will need to build a service. The service pulls the unmatched lists from your systems. It then makes consistent flyweights. The service protocol has three methods:

1. set (listAId, listBId)- Tell your systems that the objects are the same.

2. undo(listAId, listBId) - Tell the systems that the last match was wrong.

3. load() - promise to return an object containing two lists of matching flyweights. The flyweights must be display ready. They must have the exact same properties. All properties must exist, even if they are null.

Start by looking at the code in [reconcileTestService.js](./reconcileTestService.js). View [index.html](./index.html) to see it work.
