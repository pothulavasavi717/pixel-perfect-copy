-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'INSPECTOR', 'REVIEWER');

-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('CREATED', 'PROCESSING', 'COMPLETED', 'NEEDS_REVIEW', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ImageType" AS ENUM ('FRONT', 'BACK', 'SIDE', 'LABEL', 'OTHER');

-- CreateEnum
CREATE TYPE "DeclarationType" AS ENUM ('PRODUCT_NAME', 'NET_QUANTITY', 'MRP', 'MANUFACTURER', 'PACKER', 'IMPORTER', 'COUNTRY_OF_ORIGIN', 'DATE_OF_MANUFACTURE', 'BEST_BEFORE', 'CONSUMER_CARE', 'OTHER');

-- CreateEnum
CREATE TYPE "ComplianceOverallStatus" AS ENUM ('PASS', 'FAIL', 'WARNING', 'MANUAL_REVIEW');

-- CreateEnum
CREATE TYPE "ComplianceCheckStatus" AS ENUM ('PASS', 'FAIL', 'WARNING', 'MANUAL_REVIEW', 'NOT_DETECTED');

-- CreateEnum
CREATE TYPE "ViolationSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ViolationStatus" AS ENUM ('OPEN', 'REVIEWED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('PDF', 'EDITABLE');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" "Role" NOT NULL DEFAULT 'INSPECTOR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" UUID NOT NULL,
    "productName" TEXT NOT NULL,
    "brandName" TEXT,
    "manufacturerName" TEXT,
    "category" TEXT,
    "barcode" TEXT,
    "batchNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inspection" (
    "id" UUID NOT NULL,
    "inspectionNumber" TEXT NOT NULL,
    "productId" UUID NOT NULL,
    "inspectorId" UUID NOT NULL,
    "status" "InspectionStatus" NOT NULL DEFAULT 'CREATED',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" UUID NOT NULL,
    "inspectionId" UUID NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "imageType" "ImageType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtractedDeclaration" (
    "id" UUID NOT NULL,
    "inspectionId" UUID NOT NULL,
    "declarationType" "DeclarationType" NOT NULL,
    "extractedValue" TEXT,
    "confidence" DOUBLE PRECISION,
    "boundingBox" JSONB,
    "sourceImageId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExtractedDeclaration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceResult" (
    "id" UUID NOT NULL,
    "inspectionId" UUID NOT NULL,
    "overallStatus" "ComplianceOverallStatus" NOT NULL,
    "score" DOUBLE PRECISION,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "engineVersion" TEXT,

    CONSTRAINT "ComplianceResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceCheck" (
    "id" UUID NOT NULL,
    "complianceResultId" UUID NOT NULL,
    "ruleCode" TEXT NOT NULL,
    "ruleName" TEXT NOT NULL,
    "status" "ComplianceCheckStatus" NOT NULL,
    "observedValue" TEXT,
    "expectedValue" TEXT,
    "legalReference" TEXT,
    "explanation" TEXT,
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplianceCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Violation" (
    "id" UUID NOT NULL,
    "inspectionId" UUID NOT NULL,
    "complianceCheckId" UUID,
    "severity" "ViolationSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ViolationStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Violation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" UUID NOT NULL,
    "inspectionId" UUID NOT NULL,
    "violationId" UUID,
    "imageId" UUID,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" UUID NOT NULL,
    "inspectionId" UUID NOT NULL,
    "reportType" "ReportType" NOT NULL,
    "filePath" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generatedBy" UUID NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE INDEX "Product_productName_idx" ON "Product"("productName");

-- CreateIndex
CREATE INDEX "Product_barcode_idx" ON "Product"("barcode");

-- CreateIndex
CREATE INDEX "Product_batchNumber_idx" ON "Product"("batchNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Inspection_inspectionNumber_key" ON "Inspection"("inspectionNumber");

-- CreateIndex
CREATE INDEX "Inspection_productId_idx" ON "Inspection"("productId");

-- CreateIndex
CREATE INDEX "Inspection_inspectorId_idx" ON "Inspection"("inspectorId");

-- CreateIndex
CREATE INDEX "Inspection_status_idx" ON "Inspection"("status");

-- CreateIndex
CREATE INDEX "Inspection_createdAt_idx" ON "Inspection"("createdAt");

-- CreateIndex
CREATE INDEX "ProductImage_inspectionId_idx" ON "ProductImage"("inspectionId");

-- CreateIndex
CREATE INDEX "ProductImage_imageType_idx" ON "ProductImage"("imageType");

-- CreateIndex
CREATE INDEX "ExtractedDeclaration_inspectionId_idx" ON "ExtractedDeclaration"("inspectionId");

-- CreateIndex
CREATE INDEX "ExtractedDeclaration_sourceImageId_idx" ON "ExtractedDeclaration"("sourceImageId");

-- CreateIndex
CREATE INDEX "ExtractedDeclaration_declarationType_idx" ON "ExtractedDeclaration"("declarationType");

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceResult_inspectionId_key" ON "ComplianceResult"("inspectionId");

-- CreateIndex
CREATE INDEX "ComplianceCheck_complianceResultId_idx" ON "ComplianceCheck"("complianceResultId");

-- CreateIndex
CREATE INDEX "ComplianceCheck_ruleCode_idx" ON "ComplianceCheck"("ruleCode");

-- CreateIndex
CREATE INDEX "ComplianceCheck_status_idx" ON "ComplianceCheck"("status");

-- CreateIndex
CREATE INDEX "Violation_inspectionId_idx" ON "Violation"("inspectionId");

-- CreateIndex
CREATE INDEX "Violation_complianceCheckId_idx" ON "Violation"("complianceCheckId");

-- CreateIndex
CREATE INDEX "Violation_severity_idx" ON "Violation"("severity");

-- CreateIndex
CREATE INDEX "Violation_status_idx" ON "Violation"("status");

-- CreateIndex
CREATE INDEX "Evidence_inspectionId_idx" ON "Evidence"("inspectionId");

-- CreateIndex
CREATE INDEX "Evidence_violationId_idx" ON "Evidence"("violationId");

-- CreateIndex
CREATE INDEX "Evidence_imageId_idx" ON "Evidence"("imageId");

-- CreateIndex
CREATE INDEX "Report_inspectionId_idx" ON "Report"("inspectionId");

-- CreateIndex
CREATE INDEX "Report_generatedBy_idx" ON "Report"("generatedBy");

-- CreateIndex
CREATE INDEX "Report_reportType_idx" ON "Report"("reportType");

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtractedDeclaration" ADD CONSTRAINT "ExtractedDeclaration_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtractedDeclaration" ADD CONSTRAINT "ExtractedDeclaration_sourceImageId_fkey" FOREIGN KEY ("sourceImageId") REFERENCES "ProductImage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceResult" ADD CONSTRAINT "ComplianceResult_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceCheck" ADD CONSTRAINT "ComplianceCheck_complianceResultId_fkey" FOREIGN KEY ("complianceResultId") REFERENCES "ComplianceResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Violation" ADD CONSTRAINT "Violation_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Violation" ADD CONSTRAINT "Violation_complianceCheckId_fkey" FOREIGN KEY ("complianceCheckId") REFERENCES "ComplianceCheck"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_violationId_fkey" FOREIGN KEY ("violationId") REFERENCES "Violation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "ProductImage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_generatedBy_fkey" FOREIGN KEY ("generatedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
