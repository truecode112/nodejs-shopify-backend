/*
 Navicat Premium Data Transfer

 Source Server         : my_ubuntu_vps
 Source Server Type    : MySQL
 Source Server Version : 80031 (8.0.31-0ubuntu0.22.04.1)
 Source Host           : 95.217.102.97:3306
 Source Schema         : slimprints

 Target Server Type    : MySQL
 Target Server Version : 80031 (8.0.31-0ubuntu0.22.04.1)
 File Encoding         : 65001

 Date: 24/01/2023 05:09:56
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for applications
-- ----------------------------
DROP TABLE IF EXISTS `applications`;
CREATE TABLE `applications`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `adminAddress` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `ctaText` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT 'YOUR CTA HERE',
  `testnetContractAddress` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `productionContractAddress` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `priceRuleId` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `adminAccessScope` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL,
  `shopifyAPIKey` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `shopifySecretKey` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `url` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `shopifyAccessToken` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `shopURL` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `tokenId` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `bannerBgColor` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '#FF0000',
  `ctaTextColor` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '#FFFFFF',
  `type` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `isPaidPremium` int NOT NULL DEFAULT 0,
  `desiredBalance` int NULL DEFAULT 1,
  `network` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT 'ethereum',
  `contractType` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT 'ERC-721A',
  `createdAt` bigint NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uid_unique`(`uid` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 13 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of applications
-- ----------------------------
INSERT INTO `applications` VALUES (12, 'HzKYklEPVQPLNrrWZ98N', '0x93bba8c55865466699ed5233bed51cf478d49850', '', 'Get 50% off your purchase', '0xC0803039252f33154F9a81eCc95CC25C481d1f11', '', '1047562158169', '[\"write_discounts\",\"read_discounts\",\"write_price_rules\",\"read_price_rules\"]', '849916adc52f3205c12c8ed9130263d2', 'ade988012f83e797f0e2954dcc121d96', 'https://slimprints.shopify.com', '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', 'https://slimprints.myshopify.com', '', '#721818', '#00ff1e', 'shop_plugin', 0, 1, 'ethereum', 'ERC-721A', 1674460555428);

-- ----------------------------
-- Table structure for discounts
-- ----------------------------
DROP TABLE IF EXISTS `discounts`;
CREATE TABLE `discounts`  (
  `_id` bigint NOT NULL AUTO_INCREMENT,
  `wallet_address` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `discount_code` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `date_created` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of discounts
-- ----------------------------

-- ----------------------------
-- Table structure for projects
-- ----------------------------
DROP TABLE IF EXISTS `projects`;
CREATE TABLE `projects`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `adminAddress` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `contractURI` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `supply` int NULL DEFAULT 5000,
  `name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT 'My Sekanson Project',
  `network` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT 'ethereum',
  `tokenSymbol` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT 'SEKANSON',
  `mintPrice` decimal(10, 3) NULL DEFAULT 0.010,
  `contractType` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT 'ERC-721A',
  `royalties` decimal(10, 1) NULL DEFAULT 3.5,
  `testnetContractAddress` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `productionContractAddress` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL DEFAULT '',
  `createdAt` bigint NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of projects
-- ----------------------------
INSERT INTO `projects` VALUES (1, 'PVWKplrR3EOISSYDTHfq', '0x93bba8c55865466699ed5233bed51cf478d49850', '', 5000, 'My Sekanson Project', 'ethereum', 'SEKANSON', 0.010, 'ERC-721A', 3.5, '', '', 1674485078658);
INSERT INTO `projects` VALUES (2, 'pwvs8IAkArtDmuqwMlf0', '0x93bba8c55865466699ed5233bed51cf478d49850', '', 5000, 'My Sekanson Project', 'ethereum', 'SEKANSON', 0.010, 'ERC-721A', 3.5, '', '', 1674485348259);

SET FOREIGN_KEY_CHECKS = 1;
