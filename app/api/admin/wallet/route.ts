import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "../../../lib/auth"
import { sql } from "../../../lib/db"
