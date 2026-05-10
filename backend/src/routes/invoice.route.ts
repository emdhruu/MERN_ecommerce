import { createPurchaseInvoice, createSalesInvoice, getAllInvoices, getInvoiceById, updateInvoiceStatus } from "../controllers/invoice.controller";
import { isAdmin } from "../middleware/isAdmin";
import { verifyingAccessToken } from "../middleware/verifyingAccessToken";
import { createRouter } from "../utils/createRouter";

const router = createRouter();

router.post("/sales", verifyingAccessToken, isAdmin, createSalesInvoice);

router.post("/purchase", verifyingAccessToken, isAdmin, createPurchaseInvoice);

router.get("/getAll", verifyingAccessToken, isAdmin, getAllInvoices);

router.get("/getById/:id", verifyingAccessToken, isAdmin, getInvoiceById);

router.put("/updateStatus/:id", verifyingAccessToken, isAdmin, updateInvoiceStatus);

export default router;
