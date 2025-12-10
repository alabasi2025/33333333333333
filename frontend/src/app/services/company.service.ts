import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Company {
  id: number;
  name: string;
  description?: string;
  commercialRegister?: string;
  taxNumber?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  units?: Unit[];
}

export interface Unit {
  id: number;
  companyId: number;
  name: string;
  description?: string;
  enabledModules: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  company?: Company;
  branches?: Branch[];
}

export interface Branch {
  id: number;
  unitId: number;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  unit?: Unit;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // Company APIs
  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.apiUrl}/companies`);
  }

  getCompany(id: number): Observable<Company> {
    return this.http.get<Company>(`${this.apiUrl}/companies/${id}`);
  }

  createCompany(company: Partial<Company>): Observable<Company> {
    return this.http.post<Company>(`${this.apiUrl}/companies`, company);
  }

  updateCompany(id: number, company: Partial<Company>): Observable<Company> {
    return this.http.put<Company>(`${this.apiUrl}/companies/${id}`, company);
  }

  deleteCompany(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/companies/${id}`);
  }

  // Unit APIs
  getUnits(companyId?: number): Observable<Unit[]> {
    const url = companyId 
      ? `${this.apiUrl}/units?companyId=${companyId}`
      : `${this.apiUrl}/units`;
    return this.http.get<Unit[]>(url);
  }

  getUnit(id: number): Observable<Unit> {
    return this.http.get<Unit>(`${this.apiUrl}/units/${id}`);
  }

  createUnit(unit: Partial<Unit>): Observable<Unit> {
    return this.http.post<Unit>(`${this.apiUrl}/units`, unit);
  }

  updateUnit(id: number, unit: Partial<Unit>): Observable<Unit> {
    return this.http.put<Unit>(`${this.apiUrl}/units/${id}`, unit);
  }

  deleteUnit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/units/${id}`);
  }

  // Branch APIs
  getBranches(unitId?: number): Observable<Branch[]> {
    const url = unitId 
      ? `${this.apiUrl}/branches?unitId=${unitId}`
      : `${this.apiUrl}/branches`;
    return this.http.get<Branch[]>(url);
  }

  getBranch(id: number): Observable<Branch> {
    return this.http.get<Branch>(`${this.apiUrl}/branches/${id}`);
  }

  createBranch(branch: Partial<Branch>): Observable<Branch> {
    return this.http.post<Branch>(`${this.apiUrl}/branches`, branch);
  }

  updateBranch(id: number, branch: Partial<Branch>): Observable<Branch> {
    return this.http.put<Branch>(`${this.apiUrl}/branches/${id}`, branch);
  }

  deleteBranch(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/branches/${id}`);
  }
}
